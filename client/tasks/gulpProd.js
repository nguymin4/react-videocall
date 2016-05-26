var gulp = require("gulp"),
	sass = require("gulp-sass"),
	rename = require("gulp-rename"),
	replace = require("gulp-replace"),
	spawn = require("child_process").spawn;

module.exports = function (env, config) {
	var input = config.input,
		output = config.output,
		metaData = require(input.html.meta);

	gulp.task("build", ["webpack:build", "sass:build", "html:build"]);
	
	gulp.task("html:build", ["env:build", "html"]);

	gulp.task("env:build", function () {
		env.isProduction = true;
	});

	gulp.task("html", function () {
		var src = gulp.src(input.html.target);

		// Add meta data
		for (var keyword in metaData) {
			var meta = metaData[keyword];
			if (typeof meta !== "string")
				meta = env.isProduction ? meta["build"] : meta["dev"];
			meta = (meta || "").replace(/[\n\t]/g, "");
			src = src.pipe(replace.call(this, "${" + keyword + "}", meta));
		}

		return src.pipe(gulp.dest(output.html));
	});

	

	gulp.task("sass:build", function () {
		return gulp.src(input.scss.target)
			.pipe(sass({ outputStyle: "compressed" }).on('error', sass.logError))
			.pipe(rename((path) => path.basename += ".min"))
			.pipe(gulp.dest(output.css));
	});


	gulp.task("webpack:build", function () {
		var args = ["--config", "webpack.config.js", "--build"];
		var webpack = spawn(env.cmd("webpack"), args, {
			detached: false,
			stdio: "inherit"
		});
		
		process.on("exit", webpack.kill);
	});
};
