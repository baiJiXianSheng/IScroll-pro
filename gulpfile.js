
// require('babel-polyfill'); // es7：async-await 
// require('babel-plugin-transform-runtime');

var gulp = require("gulp");
var babel = require('gulp-babel'); // babel转换
// var eslint = require('gulp-eslint'); // eslint检测
var rename = require('gulp-rename'); // 重命名文件
var flatten = require('gulp-flatten'); // 移除或替换文件的路径
var preprocess = require('gulp-preprocess'); // 构建一个可配置的上下文供我们在构建时使用。
// var concat = require('gulp-concat'); // 合并文件
var uglify = require('gulp-uglify'); // 压缩js
var cleanCss = require('gulp-clean-css'); // 压缩css
var less = require('gulp-less'); // less编译
// var sass = require("gulp-sass"); // sass编译
var htmlmin = require('gulp-htmlmin'); // html压缩
var imagemin = require('gulp-imagemin'); // 图片压缩
// var connect = require('gulp-connect'); // 起server服务 connect.reload()
var browserSync = require("browser-sync").create("My Server"); // 得到一个 browserSync 实例
var del = require('del'); // 清空目录
var colors = require('colors'); // 终端彩色输出结果


function errorHandler(error) {
    console.log("ERROR：".red, error);
}

const isDev = process.env.NODE_ENV === "development";

// html压缩公共函数
function htmlMin() {
    return gulp.src("src/**/*.html")
        .pipe(
            htmlmin(
                { collapseWhitespace: true }
            )
        )
        .pipe(gulp.dest("src/dist"));
}

// less/sass 转译，并压缩css
function lessmin(dev) {
    return gulp.src("src/**/*.less")
        .pipe(less())
        .pipe(cleanCss())
        .pipe(flatten())
        .pipe(gulp.dest(dev ? "src/css" : "src/dist/css")) // 默认生成 src/dist/less/a.css ==> 替换路径后：src/dist/css/a.css
    // .pipe(gulp.src("src/dist/cssmin/**/*.css"))
    // .pipe(concat("all.min.css")) // less 和 sass 编译后的css合并成一个 all.min.css
    // .pipe(gulp.dest("src/dist/cssmin"));
}
function sassmin() {
    return gulp.src("src/**/*.scss")
        .pipe(sass())
        .pipe(cleanCss())
        .pipe(flatten())
        .pipe(gulp.dest("src/dist/css"))
    // .pipe(gulp.src("src/dist/cssmin/**/*.css"))
    // .pipe(concat("all.min.css")) // less 和 sass 编译后的css合并成一个 all.min.css
    // .pipe(gulp.dest("src/dist/cssmin"));
}

/**
 * 
 * @param {String} startFile 要移动的文件目录及类型
 * @param {String} distPosition 移动到（默认应该在dist下）的目录
 */
function movefile(startFile, distPosition) {
    return gulp.src(startFile)
        .pipe(flatten())
        .pipe(gulp.dest(distPosition))
}

/**
 * 
 * @param {Boolean} containElseJsPath 是否打包除 js 目录下，其余 文件夹下的js。如 build 时，需要将 lib 下所依赖的第三方js库，同时打包到 dist 目录下，即可直接部署 dist 目录。
 */
// js 转译、压缩、合并
function jsMin(containElseJsPath) {
    // 由于 glob 匹配时是按照每个 glob 在数组中的位置依次进行匹配操作的，所以 glob 数组中的取反（negative）glob 必须跟在一个非取反（non-negative）的 glob 后面。第一个 glob 匹配到一组匹配项，然后后面的取反 glob 删除这些匹配项中的一部分。如果取反 glob 只是由普通字符组成的字符串，则执行效率是最高的。

    gulp.src(containElseJsPath ? ["src/**/*.js", "!src/js/config-define.js"] : "src/js/!(config-define|config).js")  
        .pipe(babel(
            {
                presets: ['@babel/env']
            }
        ))
        // .pipe(concat("main.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(containElseJsPath ? "src/dist" : "src/dist/js")); 
    // .pipe(gulp.src("src/dist/jsmin/*.js"))
    // .pipe(concat("main.min.js")) // 所有js目录下的js编译后的css合并成一个 main.min.js
    // .pipe(gulp.dest("src/dist/jsmin"));
}

// 图片合并压缩+
function imgMin() {
    return gulp.src("src/assets/*")
        .pipe(imagemin())
        .pipe(gulp.dest("src/dist/assets"));
}

// 新的导出写法，gulp 会自动兼容 task("", fn) 写法。
// exports.htmlMin = task(htmlMin);


/* -------------------------------------------------------- Clean -------------------------------------------------------- */
// async-await
gulp.task("clean", async function () {
    await del(["src/dist", "src/css", "src/js/config.js"]);
});

/* -------------------------------------------------------- Html -------------------------------------------------------- */
gulp.task("html:build", async function (done) {
    await htmlMin();
});

/* -------------------------------------------------------- Less -------------------------------------------------------- */
gulp.task("less:dev", function (done) {
    // await lessmin().pipe(browserSync.reload());
    lessmin(true);
    browserSync.reload();
    done();
});
gulp.task("less:build", async function () {
    await lessmin();
});

/* -------------------------------------------------------- Sass -------------------------------------------------------- */
gulp.task("sass:dev", function (done) {
    sassmin();
    browserSync.reload();
    done();
});
gulp.task("sass:build", async function () {
    await sassmin();
});

/* -------------------------------------------------------- Js -------------------------------------------------------- */
gulp.task("js:dev", function (done) {
    // 开发环境时，js 目录下文件变化只刷新，不编译生成
    // jsMin();
    browserSync.reload();
    done();
});
gulp.task("js:build", async function () {
    await jsMin(true);
});

/* -------------------------------------------------------- JsConfig -------------------------------------------------------- */
function setJSConfig (build) {
    if (build === "reload") {
        gulp.src("src/js/config-define.js", { allowEmpty: true })
            .pipe(preprocess({
                context: {
                    // 此处可接受来自package.json中调用命令的 NODE_ENV 参数
                    NODE_ENV: process.env.NODE_ENV,
                },
            }))
            .pipe(rename("config.js"))
            .pipe(gulp.dest("src/js"));

        browserSync.reload();
    } else {
        gulp.src("src/js/config-define.js", { allowEmpty: true })  // allowEmpty 未找到匹配文件时，忽略报错
            .pipe(preprocess({
                context: {
                    // 此处可接受来自package.json中调用命令的 NODE_ENV 参数
                    NODE_ENV: process.env.NODE_ENV,
                },
            }))
            // 生产环境时 编译es6
            .pipe(babel(
                {
                    presets: build === true ? ['@babel/env'] : null
                }
            ))
            .pipe(rename("config.js"))
            .pipe(gulp.dest(build === true ? "src/dist/js" : "src/js"));
    }
    
}

/* -------------------------------------------------------- Image -------------------------------------------------------- */
gulp.task("img:dev", function (done) {
    imgMin();
    browserSync.reload();
    done();
});
gulp.task("img:build", async function () {
    await imgMin();
});

/* -------------------------------------------------------- MoveFile -------------------------------------------------------- */
gulp.task("moveCss", async function () {
    await movefile(["src/*/*.css", "!src/{dist,css}"], isDev ? "src/css" : "src/dist/css");
    browserSync.reload();
});

/* -------------------------------------------------------- Server -------------------------------------------------------- */
gulp.task("server", function (done) {
    /*
    connect.server({
        root: 'src/',
        port: 3000,
        livereload: true
    });
    // */

    // browser-sync 2.0.0+
    browserSync.init({
        // server: "src", // 静态服务器根目录，可设置多目录数组： [ "src", "dist" ]
        // proxy: "192.168.0.2", // 代理

        //* dev 时会报错，必须要 默认静态服务器根目录下 index.html ?
        server: {
            baseDir: "src", // "./" 可使 dist 生成后位于根目录下，但 dev 环境时，所有src下资源相对路径引用时都会找不到。故使 dist 生成于src目录下，在同一个 静态服务器，方便开发环境（动态生成 link-css）时资源路径统一，且可访问到。
            index: "index.html",
        }
        // */
    });

    // 或通过执行回调，告知gulp这个异步任务已经完成
    done();
});

/* -------------------------------------------------------- Watch -------------------------------------------------------- */
gulp.task("watch", function (done) {
    // 可将公用css（如base.css）单独打包出来，在每个页面引入base.css，代替在每个less文件中 @import base.css，可利用CDN 浏览器读取缓存 base.css，减少http请求同时减小请求（页面对应的less转译后）的css文件大小
    // gulp.series("moveCss");

    
    // watch 方法的第二个可选参数 { ignoreInitial: false } 会在该 watch 任务结束后才执行一次
    gulp.watch("src/less/*.less", gulp.series("less:dev"));
    // gulp.watch("src/sass/*.scss", gulp.series("sass:dev"));

    gulp.watch("src/less/*.css", gulp.series("moveCss"));
    
    // "src/js/!(config-define|config).js"：【匹配 src/js 目录下，排除 config.js 和 config-define.js 以外的其余所有的js】：首次执行生成config配置文件后，不再监听和编译 config.js 和 config-define.js 两个文件
    gulp.watch([ "src/js/*.js", "!src/js/config.js" ]).on("change", function (filename, eventType) {
        // console.log("src/js 目录下文件变化，文件名：", filename, "Status：", eventType);
        
        // 开发环境时，监听 config-define.js 文件变化 并自动编译、刷新
        if (filename.indexOf("config-define.js") > -1)
            setJSConfig("reload");
        else
            browserSync.reload();

        // 该方式调用无效
        // gulp.series("js:dev");
    }); 

    gulp.watch("src/assets/*", gulp.series("img:dev"));

    // html文件变化时只刷新不压缩
    gulp.watch("src/**/*.html").on('change', function (filename, eventType) {
        browserSync.reload();
    }); 
    
    done();
});


/* -------------------------------------------------------- Task -------------------------------------------------------- */
// gulp.series 和 gulp.parallel 可无限嵌套

// production-build
gulp.task("build", gulp.series("clean", gulp.parallel(/* 等 config 配置生成后再 js:build 打包包含config的所有js */ gulp.series(function (cb) {
    setJSConfig(true);
    cb();
}, "js:build"), "moveCss", "less:build", "html:build", "img:build")));

// development
// 需要在打开html之前执行less转译，使得html中可加载到css目录下的css，和 config 文件生成配置
gulp.task("dev", gulp.series("clean", gulp.parallel(function (cb) {
    setJSConfig();
    cb(/*"The “setJSConfig” task was failed, please check the confgi-define.js!".bgRed*/);
}, "less:dev", "moveCss"), "watch", "server"));



/* -------------------------------------------------------- CMD -------------------------------------------------------- */
// 开发环境时 $ gulp dev 
// 生产环境时 $ gulp build 

// 因在 package.json 配置了脚本命令且使用了 gulp-preprocess，故也可以使用 yarn dev 或者 yarn build 命令