import Vue from 'vue'
import RouterView from './util/RouterView.vue'

Vue.config.productionTip = false

import routerGenerator from './util/router-generator'
routerGenerator.addViewRoute(require.context("./views", true, /\.vue$/))
const router = routerGenerator.generate()

new Vue({
  router,
  // store,
  render: h => h(RouterView)
}).$mount('#app')
