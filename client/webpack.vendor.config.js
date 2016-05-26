var webpack = require("webpack");
var isProduction = process.argv.indexOf("--build") !== -1 ||
	process.env["NODE_ENV"] === "Production";

var plugins = [];
if (isProduction)
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

module.exports = {
	context: __dirname,
	entry: {
		vendor: "./src/js/vendor.js"
	},
	output: {
		path: "./dist/js",
		filename: isProduction ? "[name].min.js" : "[name].js"
	},
	resolve: {
		resolve: {
			extensions: [".js", ""]
		},
        alias: isProduction ? {
			"react": "react/dist/react-with-addons.min.js",
			"react-dom": "react-dom/dist/react-dom.min.js"
        } : {
		}
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			loader: "babel-loader",
			query: {
				presets: ["es2015"],
				cacheDirectory: true
			}
		}]
	},
	plugins: plugins
};