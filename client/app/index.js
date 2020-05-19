import { createHook } from "overmind-react";

import { createOvermind } from "overmind";
// import { createOvermind } from "../util/statemanager";
// import { namespaced } from "overmind/config";
// import dev from "./dev";
// import errorhandler from "./errorhandler";
// import demo from "./demo";
// import counters from "./counters";

import { logLoader } from "../src/util/logloader";
logLoader(module);
const state = {
  title: "This title"
}
const actions = {

}
const metaconfig = {};
metaconfig.main =
{
state,
actions
}
// metaconfig.counters = counters;
// metaconfig.errorhandler = errorhandler;
// metaconfig._dev = dev;
// metaconfig._demo = demo;

const config = metaconfig.main //namespaced(metaconfig);
console.log("Config", config);

// console.log("state", state);
export let app;
export let useApp;

const initialize = () => {
  app = createOvermind(config, {
    // devtools: 'penguin.linux.test:8080', //
    // devtools: "localhost:3031"
  });
  console.log(app.state);
  useApp = createHook();
};

if (!module.hot) {
  console.log("not hot");
  //   initialize();
  initialize();
} else {
  if (!module.hot.data) {
    console.log("no hot data");
    initialize();
    module.hot.dispose(data => {
      console.log("Disposing");
      if (config.statemanager) {
        data.statemanager = config.statemanager;
        data.statemanager.reactionDisposers.forEach(dispose => dispose());
      }
    });
    /** Now we should always have module.hot.data */
  } else {
    console.log("Hot data");
    if (module.hot.data.statemanager)
      module.hot.data.statemanager.reactionDisposers.forEach(dispose =>
        dispose()
      );
    initialize();

    module.hot.data.statemanager = config.statemanager;
    // app = module.hot.data.app
    // useApp = module.hot.data.useApp
    // config.onInitialize(config, app);
    // module.hot.accept(errorHandler);
  }
}
