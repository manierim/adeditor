<template>
  <div id="app">
    <LoadRoute
      @loading-status="mapLoading = $event"
      @map-image-change="mapImageURL = $event"
      @map-xml-loaded="mapLoaded"
    />
    <ul>
      <li v-if="error"><span v-text="error" /></li>
      <template v-if="map">
        <li>
          <span> Waypoints: {{ map.waypoints.length }}</span>
        </li>
        <li>
          <label for="mapsize">Map Size: </label>
          <input type="number" id="mapsize" v-model="map.size" />
        </li>
      </template>
    </ul>
    <Map v-if="!mapLoading && map" :map="map" :mapImageURL="mapImageURL" />
  </div>
</template>

<script>
import LoadRoute from "./components/LoadRoute";
import Map from "./components/Map";

export default {
  name: "App",
  components: {
    LoadRoute,
    Map,
  },
  data: () => ({
    mapImageURL: null,
    mapLoading: false,
    error: null,
    map: null,
  }),
  computed: {
    fileTypeDesc() {
      if (!this.map) {
        return;
      }
      if (this.map.fileType === "config") {
        return "Savegame (config file)";
      }
      if (this.map.fileType === "routeManagerExport") {
        return "Route Manager Exported Route";
      }
      return this.map.fileType;
    },
  },

  methods: {
    mapLoaded(response) {
      this.error = response.error;
      if (response.map) {
        this.map = response.map;
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

input[type="number"] {
  text-align: center;
}

#mapsize {
  width: 5em;
}
</style>
