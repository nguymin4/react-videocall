const { DefinePlugin, optimize } = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const addBaseConfig = require('./webpack-base.config');

const extractSassPlugin = new ExtractTextPlugin({
  filename: 'dist/css/[name].min.css'
});

const configs = addBaseConfig({
  output: {
    filename: 'dist/js/[name].min.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSassPlugin.extract({
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
      }
    ]
  },
  plugins: [
    extractSassPlugin,
    new DefinePlugin({ SOCKET_HOST: '' }),
    new optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: false,
      output: {
        semicolons: true
      },
      compress: {
        warnings: true
      }
    })
  ]
});

module.exports = configs;
