const gulp = require('gulp')
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const watch = require('gulp-watch');
const connect = require('gulp-connect');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const pump = require('pump');
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const del = require("del");


gulp.task('delete-images', function() {
  return del('./dist/images/**');
});
gulp.task('copy-images',['delete-images'], function() {
  return gulp.src('./src/images/**/*')
    .pipe(gulp.dest('./dist/images'))
    .pipe(connect.reload());
});

gulp.task('delete-fonts', function() {
  return del('./dist/css/fonts/**');
});
gulp.task('copy-fonts',['delete-fonts'], function() {
  return gulp.src('./src/css/fonts/**/*')
    .pipe(gulp.dest('./dist/css/fonts'))
    .pipe(connect.reload());
});


gulp.task('pug', function buildHTML() {
  return gulp.src('./src/pug/*.pug')
    .pipe(pug({ pretty: true }).on('error', notify.onError(function (error) {
      console.log(error.toString());
      return error.message;
    })))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('sass', function () {
  return gulp.src('./src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' })
      .on('error', sass.logError)
      .on('error', notify.onError(function (error) {
        return error;
      }))
    )
    
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
    }))
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});

gulp.task('concat', function () {
  return gulp.src([
    './src/js/start.js',
    './src/js/partials/*.js',
    './src/js/end.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./src/js'));
});

gulp.task('concat-vendors', function () {
  return gulp.src('./src/js/vendors/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('vendors.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js'))
    .pipe(connect.reload());
});


gulp.task('uglify', ['concat'], function (cb) {
  pump([
    gulp.src('./src/js/scripts.js'),
    uglify().on('error', notify.onError(function (error) {
      console.log(error.toString());
      return error.message;
    })),
    rename({ suffix: '.min' }),
    gulp.dest('./dist/js')
  ],
    cb
  ).pipe(connect.reload());
});

gulp.task('watch', function () {
  watch('./src/scss/**/*.scss', function(){
    setTimeout(function(){
      gulp.start('sass');
    }, 400)
  });
  watch('./src/pug/**/*.pug', function(){
    gulp.start('pug');
  });
  watch('./src/js/vendors/*.js', function(){
    gulp.start('concat-vendors');
  });
  watch('./src/js/partials/*.js', function(){
    gulp.start('uglify');
  });
  watch('./src/images/**/*', function () {
    gulp.start('copy-images');
  });
  watch('./src/fonts/**/*', function () {
    gulp.start('copy-fonts');
  });
});

gulp.task('connect', function() {
  connect.server({
    root: './dist',
    livereload: true,
    port: 8080
  });
});

gulp.task('default', ['connect', 'watch']);

gulp.task('build', [
  'pug',
  'sass',
  'concat-vendors',
  'uglify',
  'copy-images',
  'copy-fonts'
]);