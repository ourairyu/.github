const { serveSite } = require('./serve');
const { deploySite } = require('./deploy');

function execCommand(subCommand, target, ...args) {
  if (subCommand === 'serve') {
    serveSite(target);
  } else if (subCommand === 'deploy') {
    deploySite(target);
  }
}

module.exports = { execCommand };
