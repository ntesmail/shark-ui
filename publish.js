const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const exec = require('child_process').exec;
const config = require('./shark-automation-config.js');
const publishDir = 'dist';
const publishFile = 'shark-ui.js';

fse.ensureDirSync(config.build);
fse.emptyDirSync(config.build);
fse.ensureDirSync(publishDir);
fse.emptyDirSync(publishDir);

exec('npm run build', function (err, stdout, stderr) {
    if (err) {
        console.log('error:' + err);
    } else {
        fse.copySync(path.join(config.build, config.buildStatic, config.staticVersion, config.jsDistPath), publishDir);
        var files = fs.readdirSync(publishDir);
        files && files.forEach((item) => {
            if (item.indexOf('shark') > -1) {
                fse.move(path.join(publishDir, item), path.join(publishDir, publishFile));
            }
        });
    }
});
