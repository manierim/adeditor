import Vue from 'vue'
import App from './App.vue'
import './assets/tailwind.css'

require("typeface-roboto");
require("material-icons");

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
