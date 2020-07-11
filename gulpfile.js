const { src, dest, parallel } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');

function js() {
  return src('src/index.js', { sourcemaps: true })
    .pipe(
      babel({
        presets: ['@babel/env'],
      }),
    )
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('dist'));
}

module.exports = {
  default: parallel(js),
};
