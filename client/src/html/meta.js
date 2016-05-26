var exec = require("child_process").execSync;

var bsHost = "http://localhost:3001";
var bsVersion = exec("browser-sync --version").toString().trim();


module.exports = {
	"app.js": {
		"dev": `${bsHost}/dist/js/app.js`,
		"build": "dist/js/app.min.js"
	},
	"vendor.js": new FilePath("dist/js/vendor.js"),
	"app.css": new FilePath("dist/css/app.css"),
	"browser-sync": {
		"dev": `<script async src="${bsHost}/browser-sync/browser-sync-client.${bsVersion}.js"></script>`,
		"build": ""
	},
	"server-socket" : {
		"dev": "http://localhost:5000/socket.io/socket.io.js",
		"build": "http://localhost:5000/socket.io/socket.io.js"
	}
};

/**
 * Creates a object generate links to file used in development and production.
 * @constructor
 * @param {string} path path to file
 */
function FilePath(path) {
	this.dev = path;
	var index = path.lastIndexOf(".");
	this.build = path.substring(0, index) + ".min" + path.substring(index);
}