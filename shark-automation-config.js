module.exports = {
    comment: 'shark-ui',
    version: '2.0.0-rc.1',
    product: 'shark-ui', //项目名称
    contextPath: '/shark-ui', //请求的根路径
    protocol: 'http', //项目使用的协议
    browserPort: 9300, //给browser sync使用的端口
    port: 9200, //express 起的端口
    hostname: 'localhost', //模拟域名
    openurl: 'http://localhost:9300/shark-ui/index.html', //自动打开的url
    rootPath: __dirname, //项目的根目录
    webapp: 'src/main/webapp', //前端代码的根目录
    mock: 'src/test/mock', //mock文件的根目录
    scssPath: 'style/scss', //scss文件的目录，相对于webapp
    cssPath: 'style/css', //scss编译成css文件的存放目录，
    imgPath: 'style/img', //img目录，相对于webapp
    videoPath: 'style/video', //video目录
    jsSrcPath: 'scripts/src', //scripts源码目录
    jsDistPath: 'scripts/dist',
    fontPath: 'font', //fonts目录
    htmlPath: 'examples', //html目录
    ajaxPrefix: '/xhr', //ajax请求的根路径
    mimgPathPrefix: '/hxm', //静态资源请求的根路径
    staticVersion: '20170601', // 
    build: 'build',
    appPath: 'app',  //前端模板build之后该放置的位置
    buildWebapp: 'app',  //build之后的，主要是后端的一些class文件和前端模板，相对于build
    buildStatic: 'mimg',  //build之后的静态资源文件，相对于build
    //required
    mimgURLPrefix: {
        online: '',
        test: ''
    }
};