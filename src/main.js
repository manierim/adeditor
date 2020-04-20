import Vue from "vue";

import "./assets/tooltips.css";
import VTooltip from "v-tooltip";
Vue.use(VTooltip);

require("typeface-roboto");
require("material-icons");
import "./assets/tailwind.css";

Vue.config.productionTip = false;

import App from "./App.vue";
new Vue({
  render: (h) => h(App),
}).$mount("#app");
