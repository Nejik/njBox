const env = process.env.NODE_ENV || 'development';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');
const extend = require('extend');

const addonsConfig = require('./webpack.addons');

let commonConfig = {
  entry: {
    njBox: path.resolve(__dirname, 'src/lib/njBox.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'njBox',
    libraryTarget: "umd",
    umdNamedDefine: true
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
  },
  devServer: {
    contentBase: './dist',
    port: 3000,
    clientLogLevel: "none",
    hot: true
  }
}
if(env === 'development') {
  commonConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  commonConfig.plugins.push(new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'src/index.ejs'),
    inject: false
  }))
  commonConfig.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 } },
      'postcss-loader'
    ]
  })
}
if(env === 'build') {
  commonConfig.devtool = false;
  commonConfig.module.rules.push({
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options: { importLoaders: 1 } },
        'postcss-loader'
      ]
    })
  })
  commonConfig.plugins.push(new ExtractTextPlugin("[name].css"))
}
if(env === 'production') {
  commonConfig.output.filename = '[name].min.js';
  commonConfig.devtool = false;
  commonConfig.plugins.push(new ExtractTextPlugin("[name].min.css"))
  commonConfig.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false
  }))
  commonConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
  commonConfig.module.rules.push({
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options: { importLoaders: 1 } },
        'postcss-loader'
      ]
    })
  })
}

module.exports = [commonConfig, addonsConfig];