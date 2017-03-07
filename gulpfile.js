let config = require('./project.config.js');
let webpackConfig = require('./webpack.config.js');
let postcssConfig = require('./postcss.config.js');

//common
const del = require('del');
const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const newer = require('gulp-newer');
const sourcemaps = require('gulp-sourcemaps');
const notifier = require('node-notifier'); 

//html
const ejs = require('gulp-ejs');


//styles
const postcss = require('gulp-postcss');


//images
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');


//js
const webpack = require('webpack');

//server
let serverStarted = false;
const bs = require('browser-sync').create();
global.HMR = true;


gulp.task('clean', function () {
  return del(['dist','prod'])
})

gulp.task('setProduction', function (cb) {
  config = require('./project.config.js');
  //set production mode
  process.env.NODE_ENV = 'production';
  // process.argv.push('--watch');
  //clear cache
  delete require.cache[require.resolve('./project.config.js')]
  delete require.cache[require.resolve('./webpack.config.js')]
  delete require.cache[require.resolve('./postcss.config.js')]
  //set new configs for production mode
  config = require('./project.config.js');
  webpackConfig = require('./webpack.config.js');
  postcssConfig = require('./postcss.config.js');

  cb();
})

gulp.task('html', function () {
  return gulp.src(config.html.src)
            .pipe(plumber({
              errorHandler: function (error) {
                notifier.notify({
                  title: config.name,
                  message: 'html error',
                  icon: path.join(__dirname, 'other/html.png'),
                  sound: true,
                  // wait:true
                });
                this.emit('end');
              }
            }))
            .pipe(ejs({//data, A hash object where each key corresponds to a variable in your template.
              config: config
            },
            {//options, A hash object for ejs options.
              root: config.src
            },
            {//settings, A hash object to configure the plugin.
              ext: '.html'
            }
            ))
            .on('error', gutil.log)
            .pipe(rename({dirname: ''}))
            .pipe(gulp.dest(config.html.dist))
            .pipe(gulpIf(config.isDevelopment, bs.stream()))
})

gulp.task('css:createEmptyFiles', function (cb) {
  //create styles empty placeholder files to avoid errors in console
  if (!fs.existsSync(config.dist)){
    fs.mkdirSync(config.dist);
  }
  fs.writeFileSync(path.join(config.dist, config.css.concatGulp), '');
  fs.writeFileSync(path.join(config.dist, config.css.concatWebpack), '');

  
  cb();
})

//hot reloading durinig development without webpack works much much faster
gulp.task('css:common', function () {
  return gulp .src(config.css.src)
              .pipe(plumber({
                errorHandler: function (error) {
                  console.log(error.message);
                  notifier.notify({
                    title: config.name,
                    message: 'styles error',
                    icon: path.join(__dirname, 'other/postcss.png'),
                    sound: true,
                    // wait:true
                  });
                  this.emit('end');
                }
              }))
              .pipe(gulpIf(config.isDevelopment, sourcemaps.init()))
              .pipe(postcss(postcssConfig.plugins))
              .pipe(gulpIf(config.isDevelopment, sourcemaps.write()))
              .pipe(rename(config.css.concatGulp))
              .pipe(gulp.dest(config.css.dist))
})

gulp.task('css:mergeStyles', function (cb) {
  return gulp .src([path.join(config.dist, config.css.concatGulp), path.join(config.dist, config.css.concatWebpack)])
              .pipe(concat(config.css.concatProd))
              .pipe(gulp.dest(config.css.dist))

})
gulp.task('css:cleanFiles', function () {
  return del([path.join(config.dist, config.css.concatGulp), path.join(config.dist, config.css.concatWebpack)])
})

gulp.task('css', gulp.series('css:createEmptyFiles', 'css:common'))




gulp.task('webpack', function (callback) {
  webpack(webpackConfig, function(err, stats) {

    //error handling
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }
    const info = stats.toJson();
    if (stats.hasErrors()) {
      console.error(info.errors);
    }
    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }


    callback();
  });
})

gulp.task('watch', function () {
  gulp.watch(config.html.watch, gulp.series('html'));//build and reload html
  gulp.watch(config.css.watch, gulp.series('css:common'));//build css
  gulp.watch("dist/*.css").on('change', bs.reload);//reload css
})

gulp.task('serve', function (cb) {//serve contains js task, because of webpack integration
  const compiler = webpack(webpackConfig);

  const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: webpackConfig.stats,
  });

  compiler.plugin('done', stats => {
    if (stats.hasErrors()) {
        notifier.notify({
          title: config.name,
          message: 'Webpack error',
          icon: path.join(__dirname, 'other/webpack2.png'),
          sound: true,
        });
      } else {
        bs.stream()
      }

      if(!serverStarted) {
        serverStarted = true;
          
        bs.init({
          open: process.env.OPEN,
          port: config.port,
          ui: { port: config.port + 1 },
          server: {
            baseDir: config.dist,
            middleware: [
              webpackDevMiddleware,
              require('webpack-hot-middleware')(compiler),
              require('connect-history-api-fallback')(),
            ],
          },
        });
      }
  });
})











gulp.task('build', gulp.parallel('html', 'css', 'webpack'))

gulp.task('prod', gulp.series(gulp.parallel('clean', 'setProduction'), gulp.parallel('css', 'webpack'), 'css:mergeStyles', 'css:cleanFiles'))

gulp.task('default', gulp.series('html', 'css', gulp.parallel('serve','watch')))