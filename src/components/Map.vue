<template>
  <div>
    <div v-text="paths.length" />
    <svg ref="svgMap">
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
            markerWidth="1"
            markerHeight="1"
            refX="-1"
            refY=".5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M-.5,-1 L.7,.5 L-.5,2" />
          </marker>
        </defs>
        <g v-for="(path, index) in paths" :key="index">
          <title># {{ index }}</title>
          <path
            class="link"
            :class="path.bidirectional ? 'bidirectional' : 'unidirectional'"
            :d="path.d"
          />
        </g>
      </g>

      <g class="waypoints">
        <g v-for="(waypoint, index) in waypoints" :key="index">
          <circle
            class="waypoint"
            :class="{ marker: waypoint.marker ? true : false }"
            :cx="waypoint.x"
            :cy="waypoint.z"
            :r="0.7 * (waypoint.marker ? 2 : 1)"
          />

          <text
            class="label"
            v-if="waypoint.marker"
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
  }),
  props: {
    mapSize: Number,
    mapImageURL: String,
    waypoints: Array,
    links: Array,
  },
  computed: {
    paths() {
      let paths = [];
      const undonelinks = this.links.slice();

      let links;

      while ((links = undonelinks.splice(0, 1)) && links.length) {
        let current = links[0];
        let path = [];

        let wptlinkscount = {};

        ["source", "target"].forEach((direction) => {
          let wptindex = current[direction];

          while (wptindex) {
            if (direction === "target") {
              path.push(this.waypoints[wptindex - 1]);
            } else {
              path.unshift(this.waypoints[wptindex - 1]);
            }

            let nextwptindex;
            let foundIndex;

            if (!wptlinkscount[wptindex]) {
              wptlinkscount[wptindex] = links.filter(
                (testlink) =>
                  testlink.source === wptindex || testlink.target === wptindex
              );
            }

            let connected = [];

            if (wptlinkscount[wptindex] === 2) {
              connected = undonelinks.filter((testlink, index) => {
                if (
                  testlink.source === wptindex ||
                  testlink.target === wptindex
                ) {
                  if (testlink.source === wptindex) {
                    nextwptindex = testlink.target;
                  } else {
                    nextwptindex = testlink.source;
                  }
                  foundIndex = index;
                  return true;
                }
                return false;
              });
            }

            if (
              connected.length === 1 &&
              ((current.bidirectional && connected[0].bidirectional) ||
                (!current.bidirectional &&
                  nextwptindex === connected[0][direction]))
            ) {
              undonelinks.splice(foundIndex, 1);
              wptindex = nextwptindex;
            } else {
              wptindex = null;
            }
          }
        });

        if (
          !current.bidirectional &&
          path.length === 2 &&
          Math.sqrt(
            Math.pow(path[1].x - path[0].x, 2) +
              Math.pow(path[1].z - path[0].z, 2)
          ) > 4.3
        ) {
          path.splice(1, 0, {
            x: path[0].x + (path[1].x - path[0].x) / 2,
            z: path[0].z + (path[1].z - path[0].z) / 2,
          });
        }

        path = {
          bidirectional: current.bidirectional,
          d: "M" + path.map((wpt) => [wpt.x, wpt.z].join(",")).join(" L"),
        };

        paths.push(path);
      }

      return paths;
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
[ref="svgMap"] {
  background-color: lightgray;
}

.mapbounds {
  fill: white;
  stroke: rgb(59, 56, 39);
  stroke-width: 2;
}

.waypoints .waypoint {
  fill: orange;
  stroke: rgb(255, 0, 0);
  stroke-width: 0.3;
}

.waypoints .marker {
  fill: rgb(4, 0, 255);
  stroke: rgb(0, 225, 255);
  stroke-width: 0.6;
}

.waypoints .label {
  font-size: 10px;
  font-weight: 700;
  fill: rgb(9, 0, 139);
  stroke: rgb(152, 169, 192);
  stroke-width: 0.3;
}

.link {
  fill: none;
  stroke: rgb(0, 255, 0);
  stroke-width: 1.7;
}

.link.bidirectional {
  stroke: rgb(255, 0, 255);
}

.link.unidirectional {
  marker-mid: url(#arrow);
}

.links marker path {
  stroke-width: 0.3;
  stroke: rgb(6, 77, 6);
  fill: transparent;
}
</style>
