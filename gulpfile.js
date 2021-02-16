const { src, dest, parallel, series, watch} = require('gulp')
const { notify, stream } = require('browser-sync')
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

    deploy: {
		hostname:    'username@yousite.com', // Deploy hostname
		destination: 'yousite/public_html/', // Deploy destination
		include:     [/* '*.htaccess' */], // Included files to deploy
		exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ], // Excluded files from deploy
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
    return src('app/**.html') 
    .pipe(dest('dist/'))
    .pipe(browserSync.stream())
}

function images() {
    return src('app/img/**/*')
    .pipe(newer('dist/img'))
    .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
    .pipe(dest('dist/img/'))
    .pipe(browserSync.stream())
}


function startwatch() {
    watch('app/scss/*.scss', styles)
    watch(['app/**/*.js','!app/**/*.min.js'], scripts)
    watch('app/img/*.+(png|svg|jpg|gif)', images)
    watch('app/**/*.html', html).on('change', browserSync.reload)
}

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.html        = html;
exports.styles      = styles;
exports.images      = images;
exports.default     = parallel(scripts, styles, images, browsersync, html, startwatch);