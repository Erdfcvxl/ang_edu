"use strict";

const gulp = require("gulp");
const del = require("del");
const tsc = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
const tsProject = tsc.createProject("tsconfig.json");
const tslint = require('gulp-tslint');

var browserSync = require('browser-sync');
var gulp = require("gulp");
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpCleanCss = require('gulp-clean-css');
var gulpLess = require('gulp-less');
var gulpRename = require('gulp-rename');
var gulpUglify = require('gulp-uglify');
var gulpUtil = require("gulp-util");

/**
 * Remove build directory.
 */
gulp.task('clean', (cb) => {
    return del(["public"], cb);
});

gulp.task('browser-sync', function () {
    browserSync({
        server: false,
        proxy: "blind.dev"
    });
});

gulp.task('browser-sync-reload', ['compile'], function () {
    console.log(".ts changed -> browser reload ...");
    browserSync.reload();
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task('tslint', () => {
    return gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: 'prose'
        }))
        .pipe(tslint.report());
});

/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
gulp.task("compile", ["tslint"], () => {
    let tsResult = gulp.src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write(".", {sourceRoot: '/src'}))
        .pipe(gulp.dest("public"));
});

/**
 * Copy all resources that are not TypeScript files into build directory.
 */
gulp.task("resources", () => {
    return gulp.src(["src/**/*", "!**/*.ts", "!src/assets/**/*"])
        .pipe(gulp.dest("public"));
});

/**
 * Copy all required libraries into build directory.
 */
gulp.task("libs", () => {
    return gulp.src([
            'core-js/client/shim.min.js',
            'systemjs/dist/system-polyfills.js',
            'systemjs/dist/system.src.js',
            'reflect-metadata/Reflect.js',
            'rxjs/**/*.js',
            'zone.js/dist/**',
            '@angular/**/bundles/**'
        ], {cwd: "node_modules/**"}) /* Glob required here. */
        .pipe(gulp.dest("public/lib"));
});

/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task('watch', ['browser-sync'], function () {
    gulp.watch(["src/**/*.ts"], ['compile', 'browser-sync-reload']).on('change', function (e) {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });
    gulp.watch(["src/**/*.html"], ['resources']).on('change', function (e) {
        console.log('Resource file ' + e.path + ' has been changed. Updating.');
    });
    gulp.watch('./src/assets/less/**/*.less', ['css']);
});

gulp.task('css', function () {
    gulp.src([
        './src/assets/less/public.less',
    ])
        .pipe(gulpLess())
        .on('error', function (err) {
            gulpUtil.log(err.message);
        })
        .pipe(gulpAutoprefixer({ browsers: ['last 2 versions'] }))
        .pipe(gulpCleanCss())
        .pipe(gulpRename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/**
 * Build the project.
 */
gulp.task("build", ['compile', 'resources', 'libs'], () => {
    console.log("Building the project ...");
});


gulp.task("default", ['css', 'compile', 'resources', 'libs', 'watch'], function () {
    console.log("Building the project with watch ...");
});