const path = require('path');
const webpack = require('webpack');




const WorkboxWebpackPlugin = require('workbox-webpack-plugin');




module.exports = {
  mode: 'production',

  plugins: [new webpack.ProgressPlugin(), new WorkboxWebpackPlugin.GenerateSW({
          swDest: 'sw.js',
          clientsClaim: true,
          skipWaiting: false,
        })],

  module: {
    rules: []
  },

  devServer: {
    open: true,
    host: 'localhost'
  }
}