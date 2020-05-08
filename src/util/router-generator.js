import Vue from 'vue'
import VueRouter from 'vue-router'
import defaultIndex from '@/App.vue'

Vue.use(VueRouter)

export default function(context) {

  // empty routes, and then insert element into routes
  const routes = []

  // filter vue key
  const keys = context.keys().filter(key => /\.vue$/.test(key) && !/component/.test(key))
  if (keys.length == 0) throw "this context has no vue file!"

  // handle each vue file key
  keys.forEach(key => {
    const path = /\/index\.vue$/.test(key)
      ? key.substring(0, key.length-10).split("/")
      : key.substring(0, key.length-4).split("/")
    let parent = routes
    for (let i = 0; i < path.length - 1; i++) {
      const temp = parent.find(route => route.pathName == path[i])
      if (temp) {
        if (!temp.children) temp.children = []
        parent = temp.children
      } else {
        const r = {
          pathName: path[i],
          path: path[i] == "." ? "/" : path[i],
          component: defaultIndex,
          children: []
        }
        parent.push(r)
        parent = r.children
      }
    }
    let newRoute = {
      pathName: path[path.length - 1],
      path: path[path.length - 1] == "." ? "/" : path[path.length - 1],
      component: context(key).default
    }
    if (context(key).route) newRoute = {...newRoute, ...context(key).route}
    let index = -1
    const temp = parent.find(route => {
      index++
      return route.pathName == path[path.length - 1]
    })
    if (temp) {
      parent[index] = {...temp, ...newRoute}
    } else {
      parent.push(newRoute)
    }
  })

  console.log(routes)

  // use routes to construct VueRouter object and return
  return new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
}