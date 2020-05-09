import Vue from "vue";
import VueRouter from "vue-router";
import defaultIndex from "./RouterView.vue";
import NOFOUND from "./404.vue";

Vue.use(VueRouter);

export default function(context) {
  // validate
  if (!context) throw "this is no context";

  const keys = context
    .keys()
    .sort()
    .filter((key) => /\.vue$/.test(key) && !/component/.test(key));
  if (keys.length == 0) throw "this context has no vue key!";

  const routes = [];
  keys.forEach((key) => {
    const path = /\/index\.vue$/.test(key)
      ? key.substring(0, key.length - 10).split("/")
      : key.substring(0, key.length - 4).split("/");
    path[0] = "/";
    let parent = routes;
    for (let i = 0; i < path.length - 1; i++) {
      const temp = parent.find((route) => route.path == path[i]);
      if (temp) {
        if (!temp.children) temp.children = [];
        parent = temp.children;
      } else {
        const route = {
          path: path[i],
          component: defaultIndex,
          children: [],
        };
        parent.push(route);
        parent = route.children;
      }
    }
    
    const route = {
      ...(context(key).route ? context(key).route : {}),
      path: path[path.length - 1],
      component: context(key).default
    };
    const index = parent.findIndex(
      (route) => route.path == path[path.length - 1]
    );
    if (index >= 0) {
      parent[index] = { ...parent[index], ...route };
    } else {
      parent.push(route);
    }
  });

  routes.push({
    path: "/*",
    component: NOFOUND
  })

  return new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
  });
}
