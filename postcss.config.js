const config = require('./project.config');

const cssImport = require('postcss-import');
const cssAssets  = require('postcss-assets');
const cssNext = require('postcss-cssnext');
const cssNano = require('cssnano');
const cssMqPacker = require('css-mqpacker');
const cssReporter = require('postcss-reporter');

let postcssConfig = {
  //just comment: in webpack we should sent object with field plugins and array of plugins, but in gulp we should send only array, not object
  plugins: [
    cssNext
  ]
}

if (!config.isDevelopment) {
    // postcssConfig.plugins.push(cssNano({
    //                          safe:true,
    //                          autoprefixer:false//autoprefixer in cssNano works in delete mode, while in cssNext in add mode. Disable delete mode.
    //                         }))
  }
module.exports = postcssConfig;