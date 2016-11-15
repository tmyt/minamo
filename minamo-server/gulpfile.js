'use strict';

const gulp = require('gulp')
    , sass = require('gulp-sass')
    , concatCss = require('gulp-concat-css')
    , cleanCss = require('gulp-clean-css')
    , babel = require('gulp-babel');

const paths = {
  'scss': 'src/css/',
  'css': 'public/css/',
  'babel': 'src/babel/',
  'js': 'public/babel/'
};

gulp.task('scss', () => {
  return gulp.src([paths.scss + '**/*.scss', 'public/components/Umi/dist/css/bootstrap.css'])
    .pipe(sass())
    .pipe(concatCss('minamo.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.css));
});

gulp.task('babel', () => {
  return gulp.src(paths.babel + '**/*.babel')
    .pipe(babel({
      presets: ['react', 'es2015'],
      minified: true,
      comments: false
    }))
    .pipe(gulp.dest(paths.js));
});

gulp.task('build', ['babel', 'scss']);
