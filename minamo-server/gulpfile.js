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

gulp.babelTasks = function(...names){
  for(let i = 0; i < names.length; ++i){
    gulp.babelTask(names[i]);
  }
}

gulp.task('scss', () => {
  return gulp.src([paths.bootstrap + 'bootstrap.css', paths.scss + '**/*.scss'],
    {base: 'public/css'})
    .pipe(sass())
    .pipe(concatCss('minamo.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.css));
});

gulp.babelTasks('console', 'logstream');

gulp.task('babel', ['babel-console', 'babel-logstream']);

gulp.task('build', ['babel', 'scss']);
