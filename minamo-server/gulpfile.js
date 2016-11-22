'use strict';

const gulp = require('gulp')
    , sass = require('gulp-sass')
    , concat = require('gulp-concat')
    , concatCss = require('gulp-concat-css')
    , cleanCss = require('gulp-clean-css')
    , babel = require('gulp-babel');

const paths = {
  'bootstrap': 'public/components/Umi/dist/css/',
  'scss': 'src/css/',
  'css': 'public/css/',
  'babel': 'src/babel/',
  'js': 'public/js/'
};

gulp.task('scss', () => {
  return gulp.src([paths.bootstrap + 'bootstrap.css', paths.scss + '**/*.scss'],
    {base: 'public/css'})
    .pipe(sass())
    .pipe(concatCss('minamo.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.css));
});

gulp.task('babel', () => {
  return gulp.src([paths.babel + '**/*.babel', 'src/js/console.js'])
    .pipe(babel({
      presets: ['react', 'es2015'],
      minified: true,
      comments: false
    }))
    .pipe(concat('console.js'))
    .pipe(gulp.dest(paths.js));
});

gulp.task('build', ['babel', 'scss']);
