<template>
  <div>
    <svg class="flex flex-grow" id="svgMap" ref="svgMap">
      <g>
        <polygon
          class="mapbounds"
          fill="transparent"
          :points="mapBoundsPoints"
        ></polygon>

        <image
          v-if="mapImageURL"
          :x="-map.size / 2"
          :y="-map.size / 2"
          :width="map.size"
          :height="map.size"
          :href="mapImageURL"
        />
      </g>

      <g class="targets">
        <text
          v-for="marker in map.markers"
          :key="marker.wptIndex"
          class="marker-label"
          text-anchor="middle"
          :x="marker.wpt.x"
          :y="marker.wpt.z - 4"
        >
          {{ marker.name }}
          <title v-if="marker.folder" v-text="marker.folder" />
        </text>
      </g>

      <g class="links">
        <defs>
          <marker
            id="arrow"
            markerWidth=".5"
            markerHeight=".5"
            refX="-.4"
            refY=".25"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L.5,.25 L0,.5" />
          </marker>
        </defs>
        <g v-for="(path, index) in drawnPaths" :key="index">
          <title v-if="debug">path # {{ index }}</title>
          <path
            class="link"
            :class="path.bidirectional ? 'bidirectional' : 'unidirectional'"
            :d="path.d"
          />
        </g>
      </g>

      <g class="waypoints">
        <g v-for="(waypoint, index) in map.waypoints" :key="index">
          <title v-if="debug || waypoint.marker">
            {{
              waypoint.marker
                ? (waypoint.marker.folder
                    ? waypoint.marker.folder + " / "
                    : "") +
                  waypoint.marker.name +
                  (debug ? " | " : "")
                : ""
            }}
            {{ debug ? "wpt # " + index : "" }}
          </title>
          <circle
            @click="$emit('wpt-click', { event: $event, waypoint })"
            :class="[
              waypoint.isNode() ? 'node' : 'waypoint',
              { marker: waypoint.marker ? true : false },
            ]"
            :cx="waypoint.x"
            :cy="waypoint.z"
            :r="waypoint.marker ? 1.2 : waypoint.isNode() ? 0.5 : 0.3"
          />
        </g>
      </g>
    </svg>

    <div class="absolute object-left-top text-xs" v-if="debug">
      <div
        class="m-2 p-1 bg-gray-200 border border-gray-700 border-solid rounded"
      >
        Segments drawn: {{ segments.reduced }} of {{ segments.total }}
      </div>
    </div>
  </div>
</template>

<script>
import svghandling from "../utils/svghandling";

export default {
  name: "Map",
  data: () => ({
    debug: true,
  }),
  props: {
    map: Object,
    mapImageURL: String,
  },
  computed: {
    drawnPaths() {
      return this.map.paths.map((path) => {
        let reduced = this.reducePath(path.wpts);

        return {
          bidirectional: path.bidirectional,
          segments: path.wpts.length - 1,
          reducedsegments: reduced.length - 1,
          d: "M" + reduced.map((node) => [node.x, node.z].join(",")).join(" L"),
        };
      });
    },
    segments() {
      return this.drawnPaths.reduce(
        (segments, path) => {
          return {
            total: segments.total + path.segments,
            reduced: segments.reduced + path.reducedsegments,
          };
        },
        {
          total: 0,
          reduced: 0,
        }
      );
    },
    mapBoundsPoints() {
      return [
        [-this.map.size / 2, -this.map.size / 2].join(","),
        [this.map.size / 2, -this.map.size / 2].join(","),
        [this.map.size / 2, this.map.size / 2].join(","),
        [-this.map.size / 2, this.map.size / 2].join(","),
      ].join(" ");
    },
  },
  methods: {
    windowResize() {
      this.handler.resize();
    },
    reducePath(wpts) {
      function dist(point, x, z) {
        var dx = x - point.x;
        var dz = z - point.z;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
      }

      function distToSegment(point, start, end) {
        var dx = end.x - start.x;
        var dz = end.z - start.z;
        var l2 = dx * dx + dz * dz;

        if (l2 == 0) return this.dist(point, start.x, start.z);

        var t = ((point.x - start.x) * dx + (point.z - start.z) * dz) / l2;
        t = Math.max(0, Math.min(1, t));

        return dist(point, start.x + t * dx, start.z + t * dz);
      }

      return wpts.reduce((reduced, wpt, wptIndex) => {
        if (wptIndex < 2) {
          reduced.push(wpt);
          return reduced;
        }

        if (
          distToSegment(wpts[wptIndex - 1], reduced.slice(-2, -1)[0], wpt) <
          0.15
        ) {
          reduced.splice(-1)[0];
        }

        reduced.push(wpt);

        return reduced;
      }, []);
    },
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.windowResize);
  },

  mounted() {
    this.handler = new svghandling(this.$refs.svgMap);
    window.addEventListener("resize", this.windowResize);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mapbounds {
  fill: white;
  stroke: rgb(59, 56, 39);
  stroke-width: 2;
}

.waypoint {
  fill: transparent;
  stroke: rgb(78, 64, 63);
  stroke-width: 0.1;
}

.waypoint:hover {
  fill: rgb(78, 64, 63);
}

.node {
  fill: orange;
  stroke: rgb(255, 0, 0);
  stroke-width: 0.3;
}

.node:hover {
  fill: rgb(78, 64, 63);
  stroke: rgb(78, 64, 63);
}

.marker {
  fill: rgb(4, 0, 255);
  stroke: rgb(0, 225, 255);
  stroke-width: 0.4;
}

.marker-label {
  font-size: 10px;
  font-weight: 700;
  fill: rgb(9, 0, 139);
  stroke: rgb(152, 169, 192);
  stroke-width: 0.3;
}

.link {
  fill: none;
  stroke-linecap: round;
  stroke: rgb(75, 255, 75);
  stroke-opacity: 0.7;
  stroke-width: 1.5;
}

.link:hover {
  stroke-opacity: 1;
}

.link.bidirectional {
  stroke: rgb(251, 47, 251);
}

.link.unidirectional {
  marker-mid: url(#arrow);
  marker-start: url(#arrow);
}

.links marker path {
  stroke-width: 0.1;
  stroke: rgb(6, 77, 6);
  fill: transparent;
}
</style>
