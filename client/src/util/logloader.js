const doLog = true;
const logComponents = true;
const logApp = true;
const logUtil = true;
const logRoot = true;
export const logLoader = module => {
  if (doLog) {
    if (module.id) {
      if (
        (doLog && (module.id.match(/\/components\//) && logComponents)) ||
        (module.id.match(/\/app\//) && logApp) ||
        (module.id.match(/\/util\//) && logUtil) ||
        (module.id.match("/src/index") && logRoot)
      )
        console.log("loaded", module.id);
    } else {
      console.log("executed", module);
    }
  }
};
