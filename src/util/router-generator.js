import Vue from "vue";
import VueRouter from "vue-router";
import defaultIndex from "./RouterView.vue";
import NOFOUND from "./404.vue";

Vue.use(VueRouter);

export default {
  routes: [],
  addRootRoute(context, rootid) {
    if (!context) throw "this is no context";
    if (!rootid) rootid = "";

    if (this.routes.find((route) => route.rootid == rootid)) {
      throw "this root is already exist";
    }

    // filter vue key
    const keys = context
      .keys()
      .sort()
      .filter((key) => /\.(js|vue)$/.test(key) && !/component/.test(key));
    if (keys.length == 0) throw "this context has no js or vue key!";

    // handle each vue file key
    keys
      .filter((key) => /\.vue$/.test(key) && /\/index\.vue$/.test(key))
      .forEach((key) => {
        const path = key.substring(0, key.length - 10).split("/");
        path[0] = "/" + rootid;
        this.insertRouteWithView(this.findParent(path), path[path.length - 1], context(key));
      });
    keys
      .filter((key) => /\.vue$/.test(key) && !/\/index\.vue$/.test(key))
      .forEach((key) => {
        const path = key.substring(0, key.length - 4).split("/");
        path[0] = "/" + rootid;
        this.insertRouteWithView(this.findParent(path), path[path.length - 1], context(key));
      });
    keys
      .filter((key) => /\.js$/.test(key) && /\/index\.js$/.test(key))
      .forEach((key) => {
        const path = key.substring(0, key.length - 9).split("/");
        path[0] = "/" + rootid;
        this.insertRoute(this.findParent(path), path[path.length - 1], context(key));
      });
    keys
      .filter((key) => /\.js$/.test(key) && !/\/index\.js$/.test(key))
      .forEach((key) => {
        const path = key.substring(0, key.length - 3).split("/");
        path[0] = "/" + rootid;
        this.insertRoute(this.findParent(path), path[path.length - 1], context(key));
      });

    console.log(JSON.stringify(this.routes, null, 2))
  },

  findParent(path) {
    let parent = this.routes;
    for (let i = 0; i < path.length - 1; i++) {
      const temp = parent.find((route) => route.pathName == path[i]);
      if (temp) {
        if (!temp.children) temp.children = [];
        parent = temp.children;
      } else {
        const r = {
          pathName: path[i],
          path: path[i],
          component: defaultIndex,
          children: [],
        };
        parent.push(r);
        parent = r.children;
      }
    }
    return parent
  },

  insert(parent, current, newRoute) {
    const index = parent.findIndex((route) => {
      return route.pathName == current;
    });
    if (index >= 0) {
      parent[index] = { ...parent[index], ...newRoute };
    } else {
      parent.push(newRoute);
    }
  },

  insertRoute(parent, current, route) {
    const newRoute = route.default
    if (!newRoute.path) newRoute.path = current
    newRoute.pathName = current
    this.insert(parent, current, newRoute)
  },

  insertRouteWithView(parent, current, view) {
    let newRoute = {
      pathName: current,
      path: current,
      component: view.default
    };
    if (view.route) newRoute = { ...newRoute, ...view.route };
    this.insert(parent, current, newRoute)
  },

  generate() {
    // use routes to construct VueRouter object and return
    this.routes.push({
      path: "/*",
      component: NOFOUND,
    });
    return new VueRouter({
      mode: "history",
      base: process.env.BASE_URL,
      routes: this.routes,
    });
  },
};
