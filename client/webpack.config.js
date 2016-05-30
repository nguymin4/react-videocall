var path = require("path");
var webpack = require("webpack");
var socketConfig = require("../server/config.json");

var isProduction = process.argv.indexOf("--build") !== -1 ||
	process.env["NODE_ENV"] === "Production";

var plugins = [
	new webpack.DefinePlugin({
		SOCKET_HOST: JSON.stringify(isProduction ?
			// process.env.HOST + ":" + process.env.PORT :
			"" :
			"localhost" + ":" + socketConfig["PORT"])
    })
];

if (isProduction) {
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		sourceMap: false,
		mangle: false,
		output: {
			semicolons: true
		},
		compress: {
			warnings: true
		}
	}));
}

module.exports = {
	context: __dirname,
	entry: {
		app: "./src/js/app.js"
	},
	output: {
		path: path.resolve(__dirname, "dist/js"),
		publicPath: "/dist/js",
		filename: isProduction ? "[name].min.js" : "[name].js"
	},
	resolve: {
		extensions: [".jsx", ".js", ""]
	},
	externals: {
		"react": "React",
		"react-dom": "ReactDOM",
		"classnames": "classnames",
		"webrtc": "webrtc"
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			loader: "babel-loader",
			query: {
				presets: ["react", "es2015"],
				cacheDirectory: true
			}
		}]
	},
	plugins: plugins
};