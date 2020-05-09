import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default function(context) {
  // validate
  if (!context) throw "this is no context";

  // filter js file key
  const keys = context
    .keys()
    .sort()
    .filter((key) => /\.js$/.test(key));
  if (keys.length == 0) throw "there is no js file key";

  let store = {};
  keys.forEach((key) => {
    const path = /\/index\.js$/.test(key)
      ? key.substring(0, key.length - 9).split("/")
      : key.substring(0, key.length - 3).split("/");

    if (path.length == 1) {
      store = { ...store, ...context(key).default };
    } else {
      let parent = store;
      for (let i = 1; i < path.length - 1; i++) {
        if (!parent.modules) parent.modules = {};
        if (!parent.modules[path[i]]) parent.modules[path[i]] = {};
        parent = parent.modules[path[i]];
      }
      if (!parent.modules) parent.modules = {};
      if (parent.modules[path[path.length - 1]]) {
        parent.modules[path[path.length - 1]] = {
          ...parent.modules[path[path.length - 1]],
          ...context(key).default,
        };
      } else {
        parent.modules[path[path.length - 1]] = context(key).default;
      }
    }
  });

  return new Vuex.Store(store);
}
