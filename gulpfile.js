'use strict';
var 
gulp = require('gulp'),
pug = require('gulp-pug'),
stylus = require('gulp-stylus'),
shorthand = require('gulp-shorthand'),
svgSprite = require('gulp-svg-sprites'),
svgmin = require('gulp-svgmin'),
cheerio = require('gulp-cheerio'),
replace = require('gulp-replace'),
browserSync = require('browser-sync').create(),
concat = require('gulp-concat'),
postcss = require('gulp-postcss'),
clean = require('gulp-clean'),
autoprefixer = require('autoprefixer'),
cssnano = require('cssnano'),
uglify = require('gulp-uglify'),
pxtorem = require('postcss-pxtorem'),
imagemin = require('gulp-imagemin'),
focus = require('postcss-focus'),
postcssPresetEnv = require('postcss-preset-env'),
imageminMozjpeg = require('imagemin-mozjpeg'),
htmlmin = require('gulp-htmlmin'),
csscomb = require('gulp-csscomb'),
sourcemaps = require('gulp-sourcemaps'),
babel = require('gulp-babel'),
remember = require('gulp-remember'),
rename = require('gulp-rename');

var processors = [
autoprefixer({browsers: ['last 5 version']}),
postcssPresetEnv(),
focus(), 
pxtorem(), 
];

var cssmin = [
cssnano({
discardComments: {removeAll: true}
})
];

// Clean
gulp.task('clean', function () { 
return gulp.src('public', {read: false})
.pipe(clean());
});

// Pug
gulp.task('pug', function() {
return gulp.src('frontend/pug/*.pug')
.pipe(pug({
pretty:true
}))
.pipe(htmlmin({ 
collapseWhitespace: true,
removeComments: true
}))
.pipe(gulp.dest('public'))
});

// Stylus and css min
gulp.task('stylus', function(){
return gulp.src('frontend/stylus/*.styl','frontend/stylus/*/*.styl')
// .pipe(sourcemaps.init())
.pipe(stylus())
.pipe(shorthand())
.pipe(gulp.src('frontend/assets/css/*.css'))
.pipe(concat('style.css'))
.pipe(csscomb())
.pipe(postcss(processors))
// .pipe(sourcemaps.write('.'))
.pipe(gulp.dest('public/css'))
.pipe(postcss(cssmin))
.pipe(rename({
suffix: ".min"
}))
.pipe(gulp.dest('public/css'))
.pipe(browserSync.stream());
});

// Svg sprites
gulp.task('svg:build', function () {
return gulp.src('frontend/assets/images/svg/*.svg')
.pipe(cheerio({
run: function ($) {
$('[fill]').removeAttr('fill');
$('[style]').removeAttr('style');
}
}))
.pipe(svgmin({
js2svg: {
pretty: true
}
}))
.pipe(replace('&gt;', '>'))
.pipe(svgSprite({
mode: "symbols",
preview: false,
selector: "icon-%f",
svg: {
symbols: 'sprite.svg'
}
}
))
.pipe(gulp.dest('public/images/svg'))
});

// JS min
gulp.task('js:build', function(){
return gulp.src('frontend/js/*.js', {since: gulp.lastRun('js:build')})
.pipe(gulp.src('frontend/js/inc/*.js', {since: gulp.lastRun('js:build')}))
.pipe(remember('js:build'))
.pipe(babel({
"presets": ["@babel/preset-env"]
}))
.pipe(concat('lib.js'))
.pipe(gulp.dest('public/js'))
.pipe(uglify())
.pipe(rename({
suffix: ".min"
}))
.pipe(gulp.dest('public/js'))
});

// Fonts
gulp.task('fonts:build', function(){
return gulp.src('frontend/assets/fonts/fonts.css')
.pipe(postcss(processors))
.pipe(gulp.src('frontend/assets/fonts/*/*'))
.pipe(gulp.dest('public/fonts'))

});


gulp.task('json', function(){
return gulp.src('frontend/assets/*.json')
.pipe(gulp.dest('public'))

});

// Image min
// npm config set unsafe-perm=true
gulp.task('images:build', function(){
return gulp.src('frontend/assets/images/**')
.pipe(imagemin({
interlaced: true,
progressive: true,
optimizationLevel: 5,
verbose: true
}))
.pipe(imagemin([imageminMozjpeg({
quality: 85
})]))
.pipe(gulp.dest('public/images'))
});

gulp.task('watch', function(){
gulp.watch(['frontend/stylus/*.styl','frontend/stylus/*/*.styl' ,'frontend/stylus/**/*.styl'],gulp.series('stylus'))
gulp.watch(['frontend/pug/*.pug','frontend/pug/*/*.pug'],gulp.series('pug'))
gulp.watch(['frontend/js/*.js','frontend/js/inc/*.js'],gulp.series('js:build'))
});
 
gulp.task('browser-sync', function() {
browserSync.init({
server: {
baseDir: "./public"
}
});
browserSync.watch('public',browserSync.reload)
});

// ПЕРВИЧНАЯ СБОРКА 
gulp.task('build',gulp.series(
gulp.parallel('js:build','fonts:build','images:build','svg:build', 'json')));

// ЛОКАЛЬНАЯ СБОРКА 
gulp.task('dev', gulp.series('clean', gulp.parallel('build', 'pug','stylus'),
gulp.parallel('watch','browser-sync')
));

// СОБИРАЕМ И ОТПРАВЛЯЕМ НА СЕРВЕР
// gulp.task('deploy', gulp.series('clean', gulp.parallel(
// 'build','pug','stylus'), 'ftp'
// ));