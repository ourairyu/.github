const { execSync } = require('child_process');

function cp(fromPath, toPath) {
  execSync(`cp ${fromPath} ${toPath}`);
}

function rm(fileOrDirPath) {
  execSync(`rm -rf ${fileOrDirPath}`);
}

function mkdir(dirPath) {
  execSync(`mkdir ${dirPath}`);
}

function touch(filePath) {
  execSync(`touch ${filePath}`);
}

module.exports = { cp, rm, mkdir, touch };
