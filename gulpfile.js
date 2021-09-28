'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var sass = require('gulp-sass')(require('sass'));
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var del = require('del');
var concat = require('gulp-concat');

// JS
gulp.task('bundleVendorJs', function () {
  return gulp.src([
    'node_modules/swiper/swiper-bundle.js',
  ])
      .pipe(plumber())
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest('build/js'));
});

gulp.task('copyMainJs', function () {
  return gulp.src('source/js/script.js')
      .pipe(plumber())
      .pipe(gulp.dest('build/js'));
});

gulp.task('js', gulp.series(
    'bundleVendorJs',
    'copyMainJs'
));

// Styles
gulp.task('css', function () {
  return gulp.src('source/sass/style.scss')
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(postcss([autoprefixer()]))
      .pipe(csso())
      .pipe(rename('style.min.css'))
      .pipe(sourcemap.write('.'))
      .pipe(gulp.dest('build/css'))
      .pipe(server.stream());
});

// gulp.task('convertScss', function () {
//   return gulp.src('source/sass/style.scss')
//       .pipe(plumber())
//       .pipe(sourcemap.init())
//       .pipe(sass())
//       .pipe(sourcemap.write('.'))
//       .pipe(gulp.dest('source/temp'));
// });

// gulp.task('concatCss', function () {
//   return gulp.src([
//     'node_modules/swiper/swiper-bundle.css',
//     'source/temp/style.css',
//   ])
//       .pipe(plumber())
//       .pipe(sourcemap.init())
//       .pipe(concat('style.css'))
//       .pipe(postcss([autoprefixer()]))
//       .pipe(csso())
//       .pipe(rename('style.min.css'))
//       .pipe(sourcemap.write('.'))
//       .pipe(gulp.dest('build/css'))
//       .pipe(server.stream());
// });

// gulp.task('cleanTemp', function () {
//   return del('source/temp');
// });

// gulp.task('css', gulp.series(
//     'convertScss',
//     'concatCss',
//     'cleanTemp'
// ));

// Server
gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series(
      'css'
  ));

  gulp.watch('source/img/icon-*.svg', gulp.series(
      'sprite',
      'html',
      'refresh'
  ));

  gulp.watch('source/*.html', gulp.series(
      'html',
      'refresh'
  ));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

// Images
gulp.task('images', function () {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
      .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.jpegtran({progressive: true}),
        imagemin.svgo()
      ]))
      .pipe(gulp.dest('source/img'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
      .pipe(webp({quality: 90}))
      .pipe(gulp.dest('source/img'));
});

gulp.task('sprite', function () {
  return gulp.src([
    'source/img/{icon-*,htmlacademy*}.svg',
    'source/img/content/logo.svg',
    '!source/img/outer-sprite.svg'
  ])
      .pipe(svgstore({inlineSvg: true}))
      .pipe(rename('sprite_auto.svg'))
      .pipe(gulp.dest('build/img'));
});

// HTML
gulp.task('html', function () {
  return gulp.src('source/*.html')
      .pipe(posthtml([
        include()
      ]))
      .pipe(gulp.dest('build'));
});

// Copy
gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source//*.ico'
  ], {
    base: 'source'
  })
      .pipe(gulp.dest('build'));
});

// Clean
gulp.task('clean', function () {
  return del('build');
});

// Build
gulp.task('build', gulp.series(
    'clean',
    'copy',
    'js',
    'css',
    'sprite',
    'html'
));

// Start
gulp.task('start', gulp.series(
    'build',
    'server'
));
