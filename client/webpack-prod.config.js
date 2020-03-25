const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const addBaseConfig = require('./webpack-base.config');

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
    new HtmlWebpackPlugin({
      title: 'React VideoCall - Minh Son Nguyen',
      filename: path.join(__dirname, 'index.html'),
      template: 'src/html/index.html'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: { ecma: 6 }
      })
    ]
  }
});

module.exports = configs;
