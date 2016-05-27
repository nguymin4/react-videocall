var gulp = require("gulp"),
	sass = require("gulp-sass"),
	spawn = require("child_process").spawn,
	browserSync = require("browser-sync").create(),
	reload = browserSync.reload;

module.exports = function (env, config) {
	var input = config.input,
		output = config.output;

	gulp.task("build:dev", ["webpack:watch", "sass:dev", "html"]);

	gulp.task("webpack:watch", function () {
		var args = ["--port", "3000", "--inline", "--compress"];
		var webpack = spawn(env.cmd("webpack-dev-server"), args, {
			detached: false,
			stdio: "inherit"
		});

		process.on("exit", webpack.kill);
	});

	gulp.task("sass:dev", function () {
		return gulp.src(input.scss.target)
			.pipe(sass({ outputStyle: "expanded" }).on('error', sass.logError))
			.pipe(gulp.dest(output.css));
	});

	gulp.task("browser-sync", ["build:dev"], function (done) {
		browserSync.init({
			proxy: "http://localhost:3000",
			port: 3001,
			open: true,
			files: [output.css + "/**/*.css"]
		}, done);
	});

	gulp.task("dev", ["browser-sync"], function () {
		// Watch HTML
		gulp.watch(input.html.target, ["html"]);
		gulp.watch(output.html + "/*.html")
			.on("change", reload);

		// Watch SCSS
		gulp.watch(input.scss.list, ["sass:dev"]);

		// Watch JS
		gulp.watch(output.js + "/**/*.js")
			.on("change", reload);
	});
};
