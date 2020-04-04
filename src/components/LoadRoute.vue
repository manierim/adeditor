<template>
  <div class="form">
    <form>
      <span>
        XML file
        <input @change="getFile" type="file" />
      </span>
      <span>
        Map Image
        <input @change="getImage" type="file" />
      </span>
    </form>

    <ul>
      <template v-if="loading">
        <li>
          ... loading ...
        </li>
      </template>
      <template v-else>
        <li v-if="fileType">Detected type: <span v-text="fileTypeDesc" /></li>
        <li v-if="error">Error: <span v-text="error" /></li>
        <li>
          <span v-if="waypoints.length">
            Waypoints: {{ waypoints.length }}</span
          >
        </li>
        <li>
          <label for="mapsize">Map Size: </label>
          <input type="number" id="mapsize" v-model="mapSize" />
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import routeParser from "../utils/routeparser";

export default {
  name: "LoadRoute",
  props: {
    mapSize: Number,
    waypoints: Array,
  },
  data: () => ({
    fileType: null,
    error: null,
    loading: false,
  }),
  computed: {
    fileTypeDesc() {
      if (this.fileType === "config") {
        return "Savegame (config file)";
      }
      if (this.fileType === "routeManagerExport") {
        return "Route Manager Exported Route";
      }
      return this.fileType;
    },
  },
  methods: {
    loadingError(message) {
      this.error = message;
      if (message) {
        this.loadingStatus(false);
      }
      this.$emit("loading-error", message);
    },
    loadingStatus(loading) {
      if (loading === this.loading) {
        return;
      }
      this.loading = loading;
      this.$emit("loading-status", loading);
    },
    getImage(event) {
      let mapImageURL = URL.createObjectURL(event.target.files[0]);
      if (mapImageURL) {
        this.$emit("map-image-change", mapImageURL);
      }
    },
    getFile(event) {
      this.loadingStatus(true);
      this.loadingError(null);
      let selectedFile = event.target.files[0];
      let reader = new FileReader();
      let vm = this;

      reader.onload = async (e) => {
        let parser = new routeParser(e.target.result, selectedFile.name);

        await parser.parse();

        if (parser.error) {
          vm.loadingError(parser.error);
          return;
        }

        this.$emit("route-loaded", parser);
        this.loadingStatus(false);
      };
      reader.readAsText(selectedFile);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type="number"] {
  text-align: center;
}

#mapsize {
  width: 5em;
}
#wptsize {
  width: 3em;
}
</style>
