import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

import routerGenerator from './util/router-generator'
const router = routerGenerator(require.context("./views", true, /\.vue$/))

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
