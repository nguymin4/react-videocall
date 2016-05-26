module.exports = {
	input: {
		html: {
			target: "src/html/index.html",
			meta: "../src/html/meta.js"
		},
		scss: {
			target: "src/css/app.scss",
			list: "src/css/**/*.scss"
		},
		js: "src/js/**/*.js"
	},

	output: {
		html: ".",
		css: "dist/css",
		js: "dist/js"
	}
};