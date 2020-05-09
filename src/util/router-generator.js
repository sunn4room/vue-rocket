import Vue from "vue";
import VueRouter from "vue-router";
import defaultIndex from "./RouterView.vue";
import NOFOUND from "./404.vue";

Vue.use(VueRouter);

export default {
  routes: [],
  addViewRoute(context, rootString) {
    if (!context) throw "this is no context";
    if (!rootString) rootString = "";

    if (this.routes.find((route) => route.path == "/" + rootString)) {
      throw "this root is already exist";
    }

    // filter vue key
    const keys = context
      .keys()
      .sort()
      .filter((key) => /\.vue$/.test(key) && !/component/.test(key));
    if (keys.length == 0) throw "this context has no vue file!";

    // handle each vue file key
    keys
      .filter((key) => /\/index\.vue$/.test(key))
      .forEach((key) => {
        const path = key.substring(0, key.length - 10).split("/");
        path[0] = "/" + rootString;
        this.insertViewRoute(path, context(key));
      });
    keys
      .filter((key) => !/\/index\.vue$/.test(key))
      .forEach((key) => {
        const path = key.substring(0, key.length - 4).split("/");
        path[0] = "/" + rootString;
        this.insertViewRoute(path, context(key));
      });
  },

  insertViewRoute(path, view) {
    const tracer = [];
    let parent = this.routes;
    for (let i = 0; i < path.length - 1; i++) {
      const temp = parent.find((route) => route.pathName == path[i]);
      if (temp) {
        tracer.push(temp.path);
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
        tracer.push(r.path);
        parent = r.children;
      }
    }
    let newRoute = {
      pathName: path[path.length - 1],
      path: path[path.length - 1],
      component: view.default,
      meta: {
        tracer: [...tracer]
      }
    };
    if (view.route) newRoute = { ...newRoute, ...view.route };
    if (newRoute.redirect && !/^\//.test(newRoute.redirect)) {
      while (newRoute.redirect.indexOf("../") == 0) {
        newRoute.redirect = newRoute.redirect.substring(3);
        if (tracer.length != 0) tracer.pop();
        else throw "redirect is error";
      }
      newRoute.redirect =
        tracer.join("/") +
        (newRoute.redirect == "" ? "" : "/" + newRoute.redirect);
      if (newRoute.redirect[1] == "/")
        newRoute.redirect = newRoute.redirect.substring(1);
    }
    const index = parent.findIndex((route) => {
      return route.pathName == path[path.length - 1];
    });
    if (index >= 0) {
      parent[index] = { ...temp, ...newRoute };
    } else {
      parent.push(newRoute);
    }
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
