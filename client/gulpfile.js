var config = require("./tasks/config.js");
var env = {
	isWindows: process.platform.indexOf("win") !== -1,
	isProduction: /production/i.test(process.env.NODE_ENV),
	cmd: (command) => (env.isWindows) ?
		".\\node_modules\\.bin\\" + command + ".cmd" :
		"./node_modules/.bin/" + command
};

// Load development tasks
if (!env.isProduction) {
	require("./tasks/gulpDev.js")(env, config);
}

// Load production tasks
require("./tasks/gulpProd.js")(env, config);