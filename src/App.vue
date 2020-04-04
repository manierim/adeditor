<template>
  <div id="app">
    <LoadRoute
      :mapSize="mapSize"
      :waypoints="waypoints"
      :links="links"
      @map-image-change="mapImageURL = $event"
      @route-loaded="routeLoaded"
    />
    <Map
      :mapSize="mapSize"
      :mapImageURL="mapImageURL"
      :waypoints="waypoints"
      :links="links"
    />
  </div>
</template>

<script>
import LoadRoute from "./components/LoadRoute";
import Map from "./components/Map";

export default {
  name: "App",
  components: {
    LoadRoute,
    Map
  },
  data: () => ({
    mapSize: 2048,
    mapImageURL: null,
    waypoints: [],
    links: []
  }),
  methods: {
    routeLoaded({ mapSize, waypoints, links }) {
      this.mapSize = mapSize;
      this.waypoints = waypoints;
      this.links = links;
    }
  }
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
</style>
