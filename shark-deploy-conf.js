module.exports = {
    comment: 'shark组件库',
    version: '0.1.2',
    product: 'shark-ui',
    contextPath: '/shark-ui',
    protocol: 'http',
    browserPort: 9002,
    port: 19002,
    hostname: 'localhost',
    openurl: 'http://localhost:9002/shark-ui/index.html',
    rootPath: __dirname,
    tmpDir: '.tmp',
    webapp: 'src/main/webapp',
    mock: 'src/test/mock',
    scssPath: 'style/scss',
    cssPath: 'style/css',
    imgPath: 'style/img',
    videoPath: 'style/video',
    jsPath: 'js',
    fontPath: 'font',
    htmlPath: 'examples',
    templatePath: 'WEB-INF/tmpl',
    staticVersion: '20160226',
    ajaxPrefix: '/xhr',
    mimgPathPrefix: '/hxm',
    ifwebpack: true,
    mimgURLPrefix: {
        develop: '', //the rootpath of static resource during develop phase
        online: '', //the rootpath of static resource at online phase
        test: '' //the rootpath of static resource at test phase
    },
};
