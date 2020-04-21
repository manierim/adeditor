import Vue from "vue";
import VTooltip from "v-tooltip";
import "./assets/css/style.css";
import "typeface-roboto";
import "material-icons";

Vue.use(VTooltip);

Vue.config.productionTip = false;

import App from "./App.vue";
new Vue({
  render: (h) => h(App),
}).$mount("#app");
