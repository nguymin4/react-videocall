const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack');
const socketConfig = require('../config.json');
const generateWebpackConfig = require('./webpack-config-generator');

const configs = generateWebpackConfig({
  output: {
    filename: 'dist/js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader?minimize=true', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: '/',
              outputPath: 'dist/assets/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      SOCKET_HOST: JSON.stringify(`localhost:${socketConfig.PORT}`)
    }),
    new HotModuleReplacementPlugin()
  ],
  devServer: {
    compress: true,
    port: 9000,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
});

module.exports = configs;
