const { existsSync } = require('fs');
const { resolve: resolvePath } = require('path');

const { rm, mkdir, touch } = require('./cmd');

const SITE_ROOT = resolvePath(__dirname, '../../site');

function ensureDirOrFileExists(resolvedPath, type, removeWhenExists) {
  let targetExists = false;

  if (existsSync(resolvedPath)) {
    if (removeWhenExists === true) {
      rm(resolvedPath);
    }
    else {
      targetExists = true;
    }
  }

  if (!targetExists) {
    if (type === 'dir') {
      mkdir(resolvedPath);
    }
    else {
      touch(resolvedPath);
    }
  }
}

/**
 * 确保目录存在
 *
 * @param {*} dirPath 目录绝对路径
 * @param {*} removeWhenExists 是否删除已存在目录
 */
 function ensureDirExists(dirPath, removeWhenExists) {
  ensureDirOrFileExists(dirPath, 'dir', removeWhenExists);
}

module.exports = { SITE_ROOT, ensureDirExists };
