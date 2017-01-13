var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var express = require('express');
var argv = require('yargs').argv;
var runSequence = require('run-sequence');
var sharkAutomation = require('shark-automation');
var request = require('sync-request');

var config = require('./shark-deploy-conf.js');
var clean = require('gulp-clean');
var tmp = path.join(config.rootPath, config.tmpDir, 'step1');
var custombuild = require('./custombuild');

function execCmd(cmds, processOpts) {
    if (os.platform() === 'win32') {
        // windows
        var opts = ["cmd", "/c"];
    } else {
        // mac linux
        var opts = [];
    }
    opts = opts.concat(cmds);
    console.log('-------------Exec cmd: [' + opts.join(' ') + ']------------------');
    var msg = exec(opts.join(' '), 60000, processOpts);
    console.log(msg.stderr || msg.stdout);
    if (msg.status !== 0) {
        throw new Error('Exec cmd: [' + opts.join(' ') + ']');
    }
}

/***------------- build start ---------------***/
gulp.task('webpack-server-before', function(cb) {
    var modules = argv.modules;
    var content = '';
    if (modules) {
        var mArr = modules.split(',');
        mArr.map(function(m) {
            content = content + 'require(\'./components/' + m + '.ui\');\n';
        });
    } else {
        content = fs.readFileSync(path.join(config.webapp, config.jsPath, 'shark.ui.js'), { encoding: 'utf8' });
    }
    console.log(content);
    var tmp = path.join(config.webapp, config.jsPath, 'build.ui.js');
    var b = fs.existsSync(tmp);
    if (b) {
        fs.unlinkSync(tmp);
    }
    fs.writeFileSync(tmp, content, { encoding: 'utf8' });
    cb();
});

gulp.task('webpack-server-after', function(cb) {
    //删除打包需要的临时文件tmp.ui.js
    var tmp = path.join(config.webapp, config.jsPath, 'build.ui.js');
    fs.unlinkSync(tmp);
    cb();
});

gulp.task('clean-dist', function() {
    return gulp.src(['dist'], { read: false }).pipe(clean());
});

gulp.task('copy-dist', ['copy-dist-js']);

gulp.task('copy-dist-js', function() {
    return gulp.src(path.join(tmp, config.jsPath, 'shark.ui.js')).pipe(gulp.dest('dist'));
});

gulp.task('build', function(cb) {
    sharkAutomation.registerBuildTasks({
        baseConf: config,
        gulp: gulp,
        webpack: {
            replaceEntry: {
                'js/shark.ui': [path.join(__dirname, '/src/main/webapp/js/build.ui.js')]
            }
        }
    });
    var target = argv.target;
    if (!target) {
        throw new Error('--target should be provided. ex: gulp build --target test');
    }
    if (target !== 'online' && target !== 'test' && target !== 'develop') {
        throw new Error('--target should be online or test or develop');
    }

    gulp.on('error', function() {
        console.log('error error error error');
    });

    runSequence(
        // clean folders
        ['clean', 'clean-dist'], ['webpack-server-before'],
        // // compass and copy to tmp1
        ['sass-preprocess', 'webpack-server'], ['webpack-server-after'],
        // // use reference in html and ftl
        ['useref'],
        // // imagemin and copy to tmp1
        ['imagemin'],
        // // revision images
        ['revision-image'],
        // // revreplace images
        ['revreplace-css', 'revreplace-js'],
        // // revision css,js
        ['revision-css', 'revision-js'],
        // // revreplace html,ftl
        ['revreplace-html'],
        // // copy to build dir, copy java
        ['copy-dist'], ['copy-build'],
        // callback
        cb
    );

});
/***------------- build emd ---------------***/


/***-------------custom build ---------------***/
gulp.task('build-modules', function(cb) {
    sharkAutomation.registerBuildTasks({
        baseConf: config,
        gulp: gulp,
        webpack: {
            replaceEntry: {
                'js/shark.ui': [path.join(__dirname, '/src/main/webapp/js/build.ui.js')]
            }
        }
    });
    runSequence(
        ['clean-dist'],
        ['webpack-server-before'],
        ['webpack-server'],
        ['webpack-server-after'],
        ['copy-dist'],
        // callback
        cb
    );
});
/***-------------custom build emd ---------------***/

gulp.task('serve-express', function(cb) {
    custombuild.prepareCustomBuild(config);
    var app = express();
    var showdown  = require('showdown'),
    converter = new showdown.Converter();

    custombuild.makeCustomBuildAble(app, config);

    app.engine('.html', require('ejs').__express);
    // 默认后缀
    app.set('view engine', 'html');
    // 模板目录
    app.set('views', path.join(__dirname, 'src/main/webapp/examples'));
    // head
    var headContent = request('GET', 'http://shark.mail.netease.com/shark/static/head.html?v=shark-ui').getBody();
    var footContent = request('GET', 'http://shark.mail.netease.com/shark/static/foot.html?v=shark-ui').getBody();

    // index.html
    app.get(config.contextPath + '/index.html', function(req, res) {
        //向页面模板传递参数，可以传递字符串和对象，注意格式
        res.render('index', {converter: converter, headContent: headContent, footContent: footContent});
    });

    var router = sharkAutomation.registerServerRouter({
        baseConf: config,
        gulp: gulp,
        webpack: {
            replaceEntry: {
                'js/shark.ui': [path.join(__dirname, '/src/main/webapp/js/shark.ui.js')]
            },
            devtool : 'source-map'
        }
    });
    app.use(router);
    app.listen(config.port, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('express listening on %d', config.port);
        cb();
    });

});

gulp.task('serve', function(cb) {
    sharkAutomation.registerServerTasks({
        baseConf: config,
        gulp: gulp
    });
    runSequence(['browser-sync', 'serve-express'], 'open-url', cb);
});
