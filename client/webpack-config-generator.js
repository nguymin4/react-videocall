const _ = require('lodash');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const customizer = (objValue, srcValue) =>
  (_.isArray(objValue) ? objValue.concat(srcValue) : undefined);

module.exports = configs => _.mergeWith({
  context: __dirname,
  entry: {
    app: './src/entrypoint.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env']
          }
        }
      },
      {
        test: require.resolve('webrtc-adapter'),
        use: 'expose-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'React VideoCall - Minh Son Nguyen',
      filename: path.resolve(__dirname, 'index.html'),
      template: 'src/html/index.html'
    })
  ]
}, configs, customizer);
