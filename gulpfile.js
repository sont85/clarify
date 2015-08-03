'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('concat-uglify', function(){
  gulp.src('public/javascripts/*.js')
  .pipe(sourcemaps.init())
  .pipe(concat('bundle.js'))
  // .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public'));
});

gulp.task('default', function(){
  gulp.watch('public/javascripts/*.js', ['concat-uglify']);
});
