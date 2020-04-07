<template>
  <div id="app" class="flex flex-row h-screen w-screen">
    <div class="flex flex-col flex-shrink">
      <LoadRoute
        v-show="!mapLoading"
        @loading-status="mapLoading = $event"
        @map-image-change="mapImageURL = $event"
        @map-xml-loaded="mapLoaded"
      />

      <div v-if="mapLoading" class="flex flex-row text-sm p-2 mb-2">
        Loading ...
      </div>

      <div v-if="error"><span v-text="error" /></div>

      <template v-if="!mapLoading && map">
        <div class="flex flex-row text-sm p-2 mb-2">
          <span class="flex-1 text-center">
            <label class="mr-1" for="mapsize">Map Size</label>
            <input type="number" id="mapsize" list="sizes" v-model="map.size" />
            <datalist id="sizes">
              <option
                v-for="(desc, size) in defaultMapSizes"
                :key="size"
                :value="size"
                v-text="desc"
              />
            </datalist>

            <span v-if="factor" class="ml-1">({{ factor }})</span>
          </span>
        </div>
        <div class="flex flex-row text-sm p-2 mb-2">
          <span class="flex-1 text-center">
            Waypoints: {{ map.waypoints.length }}
          </span>
          <span class="flex-1 text-center">
            Paths: {{ map.paths.length }}
          </span>
        </div>
      </template>
    </div>
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
    defaultMapSizes: {
      2048: "default",
      4096: "4x",
      8192: "8x",
    },
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
    factor() {
      if (!this.map || !this.map.size) {
        return null;
      }

      if (this.defaultMapSizes[this.map.size]) {
        return this.defaultMapSizes[this.map.size];
      }

      return "custom";
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
input[type="number"] {
  text-align: center;
}

#mapsize {
  width: 5em;
}
</style>
