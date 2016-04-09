"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var copy = require("gulp-contrib-copy");
var cleanBuild = require("gulp-clean");
var runSequence = require("run-sequence");

// Очистка build
gulp.task("clean", function () {
	return gulp.src(
    "build",
    {read: false})
		.pipe(cleanBuild());
});

// Копирование файлов в build
gulp.task("copy", function() {
	gulp.src("*.html")
      .pipe(copy())
      .pipe(gulp.dest("build"));  
    gulp.src("fonts/**/*.{woff,woff2}")
      .pipe(copy())
      .pipe(gulp.dest("build/fonts"));
    gulp.src("js/**")
      .pipe(copy())
      .pipe(gulp.dest("build/js"));
});

// Оптимизация CSS
gulp.task("style", function() {
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
        ]}),
      mqpacker({sort: true})
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style-min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

// Копирование style-min.css в рабочую папку проекта
gulp.task("copy-min", function() {
	gulp.src("build/css/style-min.css")
      .pipe(copy())
      .pipe(gulp.dest("./css"));
});

// Оптимизация изображений
gulp.task("images", function(){
  return gulp.src("img/**/*.{png,jpg,gif,svg}")
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true
    }))
    .pipe(gulp.dest("build/img"));
});

//Для вотчера
gulp.task("html", function(){
  gulp.src("*.html")
    .pipe(gulp.dest("build"));
});

// Вотчер
gulp.task("serve", ["style"], function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });
  gulp.watch("less/**/*.less", ["style"]);
  gulp.watch("*.html", ["html"]);
  gulp.watch("*.html").on("change", server.reload);
});

// Запускаем всё
gulp.task("build", function(){
  runSequence("clean", ["copy","style","copy-min","images"]);
});