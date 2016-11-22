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
  'babel': 'src/babel/'
};

const BabelOptions = {
  presets: ['react', 'es2015'],
  minified: true,
  comments: false
};

gulp.babelTask = function(name){
  gulp.task(`babel-${name}`, () => {
    return gulp.src([paths.babel + `${name}/**/*.{js,babel}`])
      .pipe(babel(BabelOptions))
      .pipe(concat(`${name}.js`))
      .pipe(gulp.dest(paths.js));
  });
}

gulp.task('scss', () => {
  return gulp.src([paths.bootstrap + 'bootstrap.css', paths.scss + '**/*.scss'],
    {base: 'public/css'})
    .pipe(sass())
    .pipe(concatCss('minamo.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.css));
});

gulp.babelTask('console');

gulp.task('babel', ['babel-console']);

gulp.task('build', ['babel', 'scss']);
