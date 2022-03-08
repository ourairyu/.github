const { existsSync } = require('fs');
const { resolve: resolvePath } = require('path');
const { execSync } = require('child_process');

const { SITE_ROOT } = require('../helper');

function serveSite() {
  const siteDir = SITE_ROOT;
  const configFile = `${siteDir}/_config.yml`;

  if (!existsSync(configFile)) {
    return;
  }

  const flags = [
    `--source ${siteDir}`,
    `--destination ${resolvePath(__dirname, '../../dist')}`,
    `--config ${configFile}`,
    '--future',
    '--drafts',
    '--incremental',
  ];

  execSync(`bundle exec jekyll serve ${flags.join(' ')}`, { stdio: 'inherit' });
}

module.exports = { serveSite };
