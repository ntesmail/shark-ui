/**
 * 自定义模块化构建
 */
var path = require('path');
var fs = require('fs');
var os = require('os');
var exec = require('sync-exec');
var bodyParser = require('body-parser');
var md5 = require('md5');
var distDir = 'build_dist';

function execCmd(cmds, processOpts) {
    if (os.platform() === 'win32') {
        var opts = ["cmd", "/c"];
    } else {
        var opts = [];
    }
    opts = opts.concat(cmds);
    console.log('-------------Exec cmd: [' + opts.join(' ') + ']------------------');
    var msg = exec(opts.join(' '), 60000, processOpts);
    if (msg.status !== 0) {
        throw new Error('Exec cmd: [' + opts.join(' ') + ']');
    }
}
//初始化自定义构建的缓存文件
function prepareCustomBuild(config) {
    if (!fs.existsSync('cache')) {
        fs.mkdirSync('cache');
    }
    var cacheUrl = path.join(config.rootPath, 'cache', 'custom-build-modules.json');
    if (fs.existsSync(cacheUrl)) {
        var md5map = require(cacheUrl);
        for (var p in md5map) {
            if (md5map.hasOwnProperty(p)) {
                var url = path.join(config.rootPath, 'cache', p);
                if (fs.existsSync(url)) {
                    console.log('delete', url)
                    fs.unlinkSync(url);
                }
            }
        }
    }
    fs.writeFileSync(cacheUrl, JSON.stringify({}), { encoding: 'utf-8' });
};
//构建js、缓存、下载
function makeCustomBuildAble(app, config) {
    var cacheUrl = path.join(config.rootPath, 'cache', 'custom-build-modules.json');
    app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
    app.use(bodyParser.json()); // parse application/json
    app.all(config.contextPath + '/custom/build/modules/shark.ui.js', function(req, res) {
        // console.log(req.query);
        // console.log(req.body);
        var modules = req.query.modules || req.body.modules || '';
        if (!modules) {
            modules = 'autocomplete,dropdown,fileupload,modal,pager,popover,selecter,tabs,toastr,tree';
        }
        modules = modules.split(',').sort().toString(); //排序，保证同样的模块只生成一次
        var md5map = JSON.parse(fs.readFileSync(cacheUrl));
        var modulesMd5 = md5(modules) + '.js';
        if (md5map[modulesMd5]) {
            res.set('Content-Type', 'application/octet-stream');
            res.send(fs.readFileSync(path.join(config.rootPath, 'cache', modulesMd5), 'utf-8'));
        } else {
            execCmd(['gulp', 'build-modules', ' --modules', modules]);
            var stream1 = fs.readFileSync(path.join(config.rootPath, distDir, 'shark.ui.js'), 'utf-8');
            fs.writeFileSync(path.join(config.rootPath, 'cache', modulesMd5), stream1, { encoding: 'utf-8' });
            md5map[modulesMd5] = modules;
            fs.writeFileSync(cacheUrl, JSON.stringify(md5map), { encoding: 'utf-8' });
            res.set('Content-Type', 'application/octet-stream');
            var stream2 = fs.readFileSync(path.join(config.rootPath, distDir, 'shark.ui.js'), 'utf-8');
            res.send(stream2);
        }
    });
};
var custombuild = {
    prepareCustomBuild: prepareCustomBuild,
    makeCustomBuildAble: makeCustomBuildAble
};
module.exports = custombuild;
