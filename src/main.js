import Vue from 'vue'
import RouterView from './util/RouterView.vue'

Vue.config.productionTip = false

import routerGenerator from './util/router-generator'
const router = routerGenerator(require.context("./views", true, /\.(vue|js)$/))

import storeGenerator from './util/store-generator'
const store = storeGenerator(require.context("./store", true, /\.js$/))

new Vue({
  router,
  store,
  render: h => h(RouterView)
}).$mount('#app')
