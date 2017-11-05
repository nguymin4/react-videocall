const path = require('path');
const _ = require('lodash');
const { DefinePlugin, HotModuleReplacementPlugin, optimize } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const socketConfig = require('../config.json');

const isProduction = /Production/i.test(process.env.NODE_ENV);
const extractSassPlugin = new ExtractTextPlugin({
  filename: isProduction ? 'dist/css/[name].min.css' : 'dist/css/[name].css',
  disable: !isProduction
});

module.exports = {
  context: __dirname,
  entry: {
    app: './src/entrypoint.js'
  },
  output: {
    filename: `dist/js/${isProduction ? '[name].min.js' : '[name].js'}`
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSassPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader?minimize=true', 'sass-loader']
        })
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '/dist/assets/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env']
          }
        }
      }
    ]
  },
  plugins: _.compact([
    new DefinePlugin({
      SOCKET_HOST: JSON.stringify(isProduction ? '' : `localhost:${socketConfig.PORT}`)
    }),
    new HtmlWebpackPlugin({
      title: 'React VideoCall - Minh Son Nguyen',
      filename: path.resolve(__dirname, 'index.html'),
      template: 'src/html/index.html'
    }),
    extractSassPlugin,
    !isProduction && new HotModuleReplacementPlugin(),
    isProduction && new optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: false,
      output: {
        semicolons: true
      },
      compress: {
        warnings: true
      }
    })
  ]),
  devServer: {
    compress: true,
    port: 9000,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
};
