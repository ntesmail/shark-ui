const baseconfig = require('./shark-automation-config.js');
const path = require('path');
const request = require('sync-request');
const fs = require('fs');

shark.baseconfig = baseconfig;

shark.webpack = {
    entry: 'filename'
};

shark.plugins = {
    compile: [{
        name: 'compile-js',//如果name和内置的task一致，则会用此配置扩展该内置task。不然无需提供 
        plugins: {
            list: [{
                use: 'gulp-babel',//插件名 
                option: {
                    presets: ['babel-preset-es2015'].map(require.resolve)
                }//插件的option参数 
            }],//gulp插件列表。 
            merge: 'append'
        }
    }]
};

shark.appConfig = function (app) {
    var showdown = require('showdown'),
        converter = new showdown.Converter();

    app.engine('.html', require('ejs').__express);
    // 后缀
    app.set('view engine', 'html');
    // 模板目录
    app.set('views', path.join(__dirname, 'src/main/webapp/examples'));
    // head
    var headContent = request('GET', 'http://shark.mail.netease.com/shark/static/head.html?v=shark-ui').getBody();
    var footContent = request('GET', 'http://shark.mail.netease.com/shark/static/foot.html?v=shark-ui').getBody();

    // index.html
    app.get('/shark-ui/index.html', function (req, res) {
        //向页面模板传递参数，可以传递字符串和对象，注意格式
        res.render('index', { converter: converter, headContent: headContent, footContent: footContent });
    });
    //ajax mock
    app.use(baseconfig.contextPath + baseconfig.ajaxPrefix, function (req, res) {
        var data = path.join(baseconfig.rootPath, baseconfig.mock, baseconfig.ajaxPrefix, req.path);
        if (fs.existsSync(data)) {
            res.send(fs.readFileSync(data));
        } else {
            res.status(404).send('file not exist !');
        }
    });

}