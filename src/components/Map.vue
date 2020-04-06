<template>
  <div>
    <div v-if="debug"
      v-text="
        'paths:' +
        drawnPaths.length +
        ' | segments: ' +
        segments.reduced +
        ' / ' +
        segments.total
      "
    />
    <svg id="svgMap" ref="svgMap">
      <g>
        <polygon
          class="mapbounds"
          fill="transparent"
          :points="mapBoundsPoints"
        ></polygon>

        <image
          v-if="mapImageURL"
          :x="-mapSize / 2"
          :y="-mapSize / 2"
          :width="mapSize"
          :height="mapSize"
          :href="mapImageURL"
        />
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
          <title>path # {{ index }}</title>
          <path
            class="link"
            :class="path.bidirectional ? 'bidirectional' : 'unidirectional'"
            :d="path.d"
          />
        </g>
      </g>

      <g class="waypoints">
        <g v-for="(waypoint, index) in waypoints" :key="index">
          <title>wpt # {{ index }}</title>
          <circle
            :class="[
              waypoint.isNode() ? 'node' : 'waypoint',
              { marker: waypoint.marker ? true : false },
            ]"
            :cx="waypoint.x"
            :cy="waypoint.z"
            :r="waypoint.marker ? 1.2 : waypoint.isNode() ? 0.5 : 0.3"
          />

          <text
            v-if="waypoint.marker"
            class="marker-label"
            text-anchor="middle"
            :x="waypoint.x"
            :y="waypoint.z - 4"
            v-text="waypoint.marker.name"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import svghandling from "../utils/svghandling";

export default {
  name: "Map",
  data: () => ({
    svgHandler: null,
    debug: false,
  }),
  props: {
    mapSize: Number,
    mapImageURL: String,
    waypoints: Array,
    paths: Array,
  },
  computed: {
    drawnPaths() {
      return this.paths.map((path) => {
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
        [-this.mapSize / 2, -this.mapSize / 2].join(","),
        [this.mapSize / 2, -this.mapSize / 2].join(","),
        [this.mapSize / 2, this.mapSize / 2].join(","),
        [-this.mapSize / 2, this.mapSize / 2].join(","),
      ].join(" ");
    },
  },
  methods: {
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

  watch: {
    mapSize() {
      this.svgHandler.resetZoom();
    },
  },
  created() {
    this.svgHandler = new svghandling();
    window.addEventListener("resize", this.svgHandler.setMapSize);
  },
  mounted() {
    this.svgHandler.init(this.$refs.svgMap);
  },
  beforeDestroy() {
    this.svgHandler.destroyZoomInstance();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#svgMap {
  border: darkblue 2px solid;
  background-color: lightgray;
}

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

.node {
  fill: orange;
  stroke: rgb(255, 0, 0);
  stroke-width: 0.3;
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
  stroke: rgba(75, 255, 75, 0.7);
  stroke-width: 1.5;
}

.link.bidirectional {
  stroke: rgba(251, 47, 251, 0.7);
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
