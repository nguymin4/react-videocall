const path = require('path');
const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const addBaseConfig = require('./webpack-base.config');

const uglifyJsPlugin = new UglifyJsPlugin({
  uglifyOptions: {
    sourceMap: false,
    mangle: false,
    output: {
      semicolons: true
    }
  }
});

const configs = addBaseConfig({
  mode: 'production',
  output: {
    filename: 'js/[name].min.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets',
              publicPath: '/dist/assets'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[name].min.css' }),
    new DefinePlugin({ SOCKET_HOST: '' }),
    new HtmlWebpackPlugin({
      title: 'React VideoCall - Minh Son Nguyen',
      filename: path.join(__dirname, 'index.html'),
      template: 'src/html/index.html'
    })
  ],
  optimization: {
    minimizer: [
      uglifyJsPlugin
    ]
  }
});

module.exports = configs;
