<template>
  <div id="app" class="flex flex-row h-screen w-screen items-stretch">
    <!-- Left Col -->
    <div
      class="flex flex-grow-0 flex-col items-stretch p-2"
      style="min-width: 265px;"
    >
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
          <div v-if="selection.length" class="flex flex-col text-sm">
            <h3>Selected items</h3>
            <ul>
              <li v-for="(item, index) in selection" :key="index">
                <template v-if="item.waypoint">
                  <span>Waypoint # {{ item.waypoint.index }}</span>
                  <span
                    v-if="item.waypoint.marker"
                    v-text="item.waypoint.marker.name"
                    class="ml-1 font-bold"
                  />
                </template>
              </li>
            </ul>
          </div>
        </Card>

        <Card
          class="flex-grow-0"
          v-if="editor && (editor.actions.length || editor.redoables.length)"
        >
          <template #title>
            Undo/Redo
          </template>
          <div class="flex flex-row">
            <div class="flex-1 m-1">
              <button
                class="w-full border shadow"
                @click="undo"
                v-if="editor.actions.length"
                :title="editor.actions.slice(-1)[0].label"
              >
                Undo
              </button>
            </div>
            <div class="flex-1 m-1">
              <button
                class="w-full  border shadow"
                @click="redo"
                v-if="editor.redoables.length"
                :title="editor.redoables.slice(-1)[0].label"
              >
                Redo
              </button>
            </div>
          </div>
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
      @wpt-click="wptClick"
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
import Editor from "./utils/editing";

export default {
  name: "App",
  components: {
    Card,
    LoadRoute,
    Map,
  },
  data: () => ({
    editor: null,
    mapImageURL: null,
    mapLoading: false,
    error: null,
    defaultMapSizes: {
      2048: "default",
      4096: "4x",
      8192: "8x",
    },
  }),
  computed: {
    map() {
      if (!this.editor) {
        return null;
      }
      return this.editor.map;
    },
    selection() {
      if (!this.editor) {
        return null;
      }
      return this.editor.selection;
    },
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
        this.editor = new Editor(response.map);
      }
    },
    undo() {
      this.editor.undo();
    },
    redo() {
      this.editor.redo();
    },
    wptClick(event) {
      this.editor.wptClick(event);
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
