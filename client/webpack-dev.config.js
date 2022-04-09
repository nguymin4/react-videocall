const { HotModuleReplacementPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const socketConfig = require('../config');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      },
      {
        test: require.resolve('webrtc-adapter'),
        use: 'expose-loader'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'React VideoCall - Minh Son Nguyen',
      filename: 'index.html',
      template: 'src/html/index.html'
    })
  ],
  devServer: {
    compress: true,
    port: 9000,
    proxy: {
      '/bridge/': `http://localhost:${socketConfig.PORT}`
    }
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
};
