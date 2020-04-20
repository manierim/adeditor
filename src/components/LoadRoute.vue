<template>
  <div class="form flex flex-col text-sm">
    <div class="flex flex-col mb-2">
      <template v-if="!loading && cansave">
        <button class="w-full border shadow" @click="$emit('save-map')">
          Save
        </button>
      </template>
      <template v-else>
        <span class="flex text-xs">XML</span>
        <input
          :disabled="loading"
          class="flex text-xs"
          @change="getFile"
          type="file"
        />
      </template>
    </div>
    <div class="flex flex-col">
      <p class="flex text-xs">
        <span>Image</span>
        <span class="italic ml-1">(.dds from map or converted .png)</span>
      </p>
      <input class="flex text-xs" @change="getImage" type="file" />
      <template v-if="savePng">
        <a
          class="w-full border shadow text-center text-xs my-1"
          :download="saveName.substring(0, saveName.length - 4) + '.png'"
          :href="savePng"
        >
          Download PNG
        </a>
        <p class="flex text-xs italic">
          Conversion from DDS requires time. It is suggested to downnoald the
          converted PNG image and use it in future.
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { mapFromXMLFile } from "../utils/routeparser";
const dds = () => import(/* webpackChunkName: "dds"*/ "../utils/dds.js");

export default {
  name: "LoadRoute",
  data: () => ({
    loading: false,
    savePng: null,
    saveName: null,
  }),
  props: {
    cansave: Boolean,
  },
  methods: {
    loadingStatus(loading) {
      if (loading === this.loading) {
        return;
      }
      this.loading = loading;
      this.$emit("loading-status", loading);
    },
    async getImage(event) {
      let mapImageURL;

      if (event.target.files[0].type === "image/vnd.ms-dds") {
        let reader = new FileReader();

        reader.onload = async (e) => {
          const { createObjectURLFromDDS } = await dds();
          let url = await createObjectURLFromDDS(e.target.result);
          if (url) {
            this.savePng = url;
            this.saveName = event.target.files[0].name;
            this.$emit("map-image-change", url);
          }
        };

        reader.readAsArrayBuffer(event.target.files[0]);
      }

      if (event.target.files[0].type === "image/png") {
        mapImageURL = URL.createObjectURL(event.target.files[0]);
        if (mapImageURL) {
          this.savePng = null;
          this.$emit("map-image-change", mapImageURL);
        }
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
          await mapFromXMLFile(e.target.result, selectedFile.name)
        );
      };
      reader.readAsText(selectedFile);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
