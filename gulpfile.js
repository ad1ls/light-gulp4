const { src, dest, parallel, series, watch} = require('gulp')
const browserSync        = require('browser-sync').create()
const scss               = require('gulp-sass')
const imagemin           = require('gulp-imagemin')
const autoprefixer       = require('gulp-autoprefixer')
const concat             = require('gulp-concat')
const uglify             = require('gulp-uglify-es').default
const cleancss           = require('gulp-clean-css')
const newer              = require('gulp-newer')
const babel              = require('gulp-babel')


const baseDir        = 'app',
      destDir        = 'dist';
      preprocessor   = 'scss',
      fileswatch     = 'html,htm,txt,json,md,woff2', 
      imageswatch    = 'jpg,jpeg,png,webp,svg';

let paths = {
	scripts: {
		src: [
			baseDir + '/js/app.js'
		],
		dest: destDir + '/js',
	},

	styles: {
		src:   baseDir + '/' + preprocessor + '/app.*',
		dest:  destDir + '/css',
	},

    html: {
        src: 'app/**.html',
        dest: destDir
    },

	images: {
		src:  baseDir + '/img/**/*',
		dest: destDir + '/img',
	},

	cssOutputName: 'app.min.css',
	jsOutputName:  'app.min.js',
}

function browsersync() {
    browserSync.init({
        server: { baseDir: destDir + '/'},
        notify: false,
        online: true
    })
}

function scripts () {
    return src(paths.scripts.src)
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(concat(paths.jsOutputName))
    .pipe(uglify())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream())
}

function styles() {
    return src(paths.styles.src) 
    .pipe(scss())
    .pipe(concat(paths.cssOutputName))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 5 versions'], grid: true }))
    .pipe(cleancss(( { level: {1: { specialComments:0 } } } )))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

function html() {
    return src(paths.html.src) 
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream())
}

function images() {
    return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
    .pipe(dest(paths.images.dest))
    .pipe(browserSync.stream())
}


function startwatch() {
	watch([baseDir + '/js/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], {usePolling: true}, scripts)
	watch(baseDir  + '/' + preprocessor + '/**/*', {usePolling: true}, styles)
	watch(baseDir  + '/img/*.{' + imageswatch + '}', {usePolling: true}, images)
	watch(baseDir  + '/**/*.{' + fileswatch + '}', {usePolling: true}, html).on('change', browserSync.reload)
}

exports.browsersync = browsersync
exports.scripts     = scripts
exports.html        = html
exports.styles      = styles
exports.images      = images
exports.default     = parallel(scripts, styles, images, browsersync, html, startwatch)