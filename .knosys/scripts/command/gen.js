const { resolve: resolvePath } = require('path');
const { existsSync } = require('fs');

const { resolveRootPath, ensureDirExists, getLocalDataRoot, getLocalDocRoot } = require('../helper');
const { createChangeGenerator } = require('../generator');

module.exports = {
  execute: dataSource => {
    const srcPath = resolvePath(resolveRootPath(), dataSource);

    if (!existsSync(srcPath)) {
      return;
    }

    [getLocalDataRoot(), getLocalDocRoot()].forEach(distPath => ensureDirExists(distPath, true));

    const sourceRootPath = resolvePath(srcPath, 'data');

    createChangeGenerator(sourceRootPath, `${sourceRootPath}/blog`)();
  },
};
