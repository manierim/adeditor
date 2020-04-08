<template>
  <div id="app" class="flex flex-row h-screen w-screen items-stretch">
    <!-- Left Col -->
    <div class="flex flex-grow-0 flex-col items-stretch p-2">
      <Card class="flex-grow-0 mb-2">
        <template #title>
          Files
        </template>
        <LoadRoute
          @loading-status="mapLoading = $event"
          @map-image-change="mapImageURL = $event"
          @map-xml-loaded="mapLoaded"
        />

        <div class="flex" v-if="error">
          <span class="text-red-600 font-bold w-full " v-text="error" />
        </div>
      </Card>

      <template v-if="!mapLoading && map">
        <Card :collapsable="false" class="flex-grow mb-2">
          <template #title>
            Tools
          </template>
        </Card>

        <Card class="flex-grow-0">
          <template #title>
            Info
          </template>
          <div class="flex flex-col text-sm">
            <span class="flex text-center">
              <label class="mr-1" for="mapsize">Map Size</label>
              <input
                type="number"
                id="mapsize"
                list="sizes"
                v-model="map.size"
              />
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

            <span class="flex text-center">
              Waypoints: {{ map.waypoints.length }}
            </span>
            <span class="flex text-center">
              Paths: {{ map.paths.length }}
            </span>
          </div>
        </Card>
      </template>
    </div>
    <Map
      class="flex flex-grow border border-gray-400 rounded shadow-md m-2 ml-0 p-2"
      v-if="!mapLoading && map"
      :map="map"
      :mapImageURL="mapImageURL"
    />
  </div>
</template>

<script>
import LoadRoute from "./components/LoadRoute";
import Map from "./components/Map";

import Card from "./components/partials/Card";

export default {
  name: "App",
  components: {
    Card,
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
