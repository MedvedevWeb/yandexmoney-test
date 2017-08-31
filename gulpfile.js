'use strict';

const gulp = require('gulp'),
  pug = require('gulp-pug'),
  prefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  cssmin = require('gulp-cssmin'),
  sass = require('gulp-sass'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rename = require('gulp-rename'),
  rigger = require("gulp-rigger"),
  plumber = require('gulp-plumber'),
  watch = require('gulp-watch'),
  browserSync = require('browser-sync');

const path = {
  build: {
    vendorsJS: 'assets/js/',
    css: 'assets/css/',
    img: 'assets/img/'
  },
  src: {
    pug: 'src/pug/pages/*.pug',
    mainJs: 'src/assets/js/main.js',
    vendorsJS: 'src/assets/js/vendors.js',
    sass: 'src/assets/css/scss/main.scss',
    img: [ 'src/assets/img/**/*.*', '!src/assets/img/png-sptite/', '!src/assets/img/svg-sptite/' ]
  },
  watch: {
    pug: 'src/pug/**/*.pug',
    mainJS: [ 'src/assets/js/main.js', 'src/assets/js/main/**/*.js' ],
    vendorsJS: [ 'src/assets/js/vendors.js', 'src/assets/js/vendors/**/*.js' ],
    sass: 'src/assets/css/**/*.{css,scss,sass}',
    img: [ 'src/assets/img/**/*.*', '!src/assets/img/png-sptite/', '!src/assets/img/svg-sptite/' ]
  },
  base: './'
};

gulp.task('html:build', function () {
  gulp.src(path.src.pug)
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.base))
    .pipe(browserSync.stream());
});
gulp.task('mainJS:build', function () {
  gulp.src(path.src.mainJs)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(rename('index.js'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.base))
    .pipe(browserSync.stream());
});
gulp.task('vendorsJS:build', function () {
  gulp.src(path.src.vendorsJS)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.build.vendorsJS))
    .pipe(browserSync.stream());
});
gulp.task('css:build', function () {
  gulp.src(path.src.sass)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(path.build.css))
    .pipe(prefixer())
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.reload({stream:true}));
});
gulp.task('image:build', function () {
  gulp.src(path.src.img)
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
});
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: path.base
    }
  });
});
gulp.task('watch', function () {
  gulp.watch(path.watch.pug, [ 'html:build' ]);
  gulp.watch(path.watch.mainJS, [ 'mainJS:build' ]);
  gulp.watch(path.watch.vendorsJS, [ 'vendorsJS:build' ]);
  gulp.watch(path.watch.sass, [ 'css:build' ]);
});
gulp.task('build', [ 'html:build', 'mainJS:build', 'vendorsJS:build', 'css:build', 'image:build' ]);
gulp.task('default', [ 'build', 'browser-sync', 'watch' ]);