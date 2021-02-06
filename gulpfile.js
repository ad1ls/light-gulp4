const { src, dest, parallel, series, watch} = require('gulp');
const { notify, stream } = require('browser-sync');
const browserSync        = require('browser-sync').create();
const scss               = require('gulp-sass');
const imagemin           = require('gulp-imagemin');
const autoprefixer       = require('gulp-autoprefixer');
const concat             = require('gulp-concat');
const uglify             = require('gulp-uglify-es').default;
const cleancss           = require('gulp-clean-css');
const newer              = require('gulp-newer');
const babel              = require('gulp-babel');


function browsersync() {
    browserSync.init({
        server: { baseDir: 'dist/'},
        notify: false,
        online: true
    })
}

function scripts () {
    return src([
        'app/js/app.js'
    ])
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js/'))
    .pipe(browserSync.stream())
}

function styles() {
    return src('app/scss/app.scss') 
    .pipe(scss())
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 5 versions'], grid: true }))
    .pipe(cleancss(( { level: {1: { specialComments:0 } } } )))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
}

function html() {
    return src('app/**.html') 
    .pipe(dest('dist/'))
    .pipe(browserSync.stream())
}

function images() {
    return src('app/img/**/*')
    .pipe(newer('dist/img'))
    .pipe(imagemin())
    .pipe(dest('dist/img/'))
    .pipe(browserSync.stream())
}


function startwatch() {
    watch('app/scss/*.scss', styles)
    watch(['app/**/*.js','!app/**/*.min.js'], scripts)
    watch('app/img/*.png|svg|jpeg', images)
    watch('app/**/*.html', html).on('change', browserSync.reload)
}

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.html        = html;
exports.styles      = styles;
exports.images      = images;
exports.default     = parallel(scripts, styles, images, browsersync, html, startwatch);