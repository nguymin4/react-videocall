module.exports = {
  'app.js': {
    dev: 'dist/js/app.js',
    build: 'dist/js/app.min.js'
  },
  'vendor.js': new FilePath('dist/js/vendor.js'),
  'app.css': new FilePath('dist/css/app.css')
};

/**
 * Creates a object generate links to file used in development and production.
 * @constructor
 * @param {string} path path to file
 */
function FilePath(path) {
  this.dev = path;
  const index = path.lastIndexOf('.');
  this.build = `${path.substring(0, index)}.min${path.substring(index)}`;
}
