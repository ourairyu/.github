const { existsSync } = require('fs');
const { resolve: resolvePath } = require('path');
const { execSync } = require('child_process');

const { SITE_ROOT, ensureDirExists } = require('../helper');

function exec(cmdStr) {
  return execSync(cmdStr, { stdio: 'inherit' });
}

function deploySite() {
  const siteDir = SITE_ROOT;
  const configFile = `${siteDir}/_config.yml`;

  if (!existsSync(configFile)) {
    return;
  }

  const deployDir = resolvePath(__dirname, `../../../.tmp/meta`);
  const deployRepo = 'https://github.com/ourairyu/.github.git';
  const deployBranch = 'site';

  if (existsSync(deployDir)) {
    exec(`cd ${deployDir} && git pull origin ${deployBranch}`);
  } else {
    ensureDirExists(deployDir);
    exec(`cd ${deployDir} && git init && git remote add origin ${deployRepo} && git fetch && git checkout ${deployBranch}`);
  }

  const flags = [
    `--source ${siteDir}`,
    `--destination ${deployDir}`,
    `--config ${configFile}`,
  ];

  exec(`cd ${resolvePath(__dirname, '../../')} bundle exec jekyll clean && JEKYLL_ENV=production bundle exec jekyll build ${flags.join(' ')} && cd ${deployDir} && touch .nojekyll`);
  exec(`cd ${deployDir} && rm -rf CNAME && touch CNAME && echo meta.ourai.ws > CNAME`);
  exec(`cd ${deployDir} && git add -A && git commit -m "Generate on ${new Date()}" && git push origin ${deployBranch}`);
}

module.exports = { deploySite };
