'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('concat', function(){
  gulp.src('public/javascripts/*.js')
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('public'));
});

gulp.task('default', function(){
  gulp.watch('public/javascripts/*.js', ['concat']);
});
