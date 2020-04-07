<template>
  <div class="form flex flex-col text-sm p-2">
    <div class="flex flex-col mb-2">
      <span class="flex">XML file</span>
      <input class="flex" @change="getFile" type="file" />
    </div>
    <div class="flex flex-col mb-2">
      <span class="flex">Map Image</span>
      <input class="flex" @change="getImage" type="file" />
    </div>
  </div>
</template>

<script>
import routeParser from "../utils/routeparser";

export default {
  name: "LoadRoute",
  data: () => ({
    fileType: null,
    loading: false,
  }),
  methods: {
    loadingStatus(loading) {
      if (loading === this.loading) {
        return;
      }
      this.loading = loading;
      this.$emit("loading-status", loading);
    },
    getImage(event) {
      if (event.target.files[0].type !== "image/png") {
        return;
      }
      let mapImageURL = URL.createObjectURL(event.target.files[0]);
      if (mapImageURL) {
        this.$emit("map-image-change", mapImageURL);
      }
    },
    getFile(event) {
      this.loadingStatus(true);
      let selectedFile = event.target.files[0];
      let reader = new FileReader();

      reader.onload = async (e) => {
        this.loadingStatus(false);
        this.$emit(
          "map-xml-loaded",
          await new routeParser(e.target.result, selectedFile.name).parse()
        );
      };
      reader.readAsText(selectedFile);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
