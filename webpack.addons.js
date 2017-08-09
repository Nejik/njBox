const env = process.env.NODE_ENV || 'development';

const path = require('path');
const webpack = require('webpack');


let addonsConfig = {
  entry: {
    'njBox-gallery': path.resolve(__dirname, 'src/addons/njBox-gallery.js'),
    'njBox-popover': path.resolve(__dirname, 'src/addons/njBox-popover.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (env === 'production') ? '[name].min.js' : '[name].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env)
      }
    }),
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
            plugins: [
              "add-module-exports"
            ]
          }
        }
      }
    ]
  }
}
if(env === 'development') {
  addonsConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}
if(env === 'build') {
  addonsConfig.devtool = false;
}
if(env === 'production') {
  addonsConfig.output.filename = '[name].min.js';
  addonsConfig.devtool = false;
  addonsConfig.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false
  }))
  addonsConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
}

module.exports = addonsConfig;