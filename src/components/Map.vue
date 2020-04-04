<template>
  <div>
    <div v-text="'paths:' + paths.length + ' | segments: ' + segments" />
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
            refX="-.25"
            refY=".25"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L.5,.25 L0,.5" />
          </marker>
        </defs>
        <g v-for="(path, index) in paths" :key="index">
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
            :r="waypoint.marker ? 1.4 : waypoint.isNode() ? 0.7 : 0.3"
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
  }),
  props: {
    mapSize: Number,
    mapImageURL: String,
    waypoints: Array,
    paths: Array
  },
  computed: {
    segments() {
      return this.paths.reduce((segments, path) => {
        return segments + path.segments;
      }, 0);
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
  stroke-width: 0.6;
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
  stroke: rgb(0, 255, 0);
  stroke-width: 1.7;
}

.link.bidirectional {
  stroke: rgb(255, 0, 255);
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
