const Mock = require('mockjs');
const path = require('path');
const fs = require('fs');
const URLPattern = require('url-pattern');

const projRootPath = process.cwd();
// console.log(projRootPath, 'projRootPath')

const configFilePath = path.join(projRootPath, 'mock.config.js');
// console.log(configFilePath, 'configFilePath')

if (!fs.existsSync(configFilePath)) {
  throw new Error(`Cannot find file "${configFilePath}"`);
}

let config = require(configFilePath);
let lastTime = Date.now();

module.exports = (req, res, next) => {
  const { path, method } = req;
  const now = Date.now();
  // console.log('now - lastTime:', now - lastTime)
  if (now - lastTime > 3000) {
    delete require.cache[require.resolve(configFilePath)];
    config = require(configFilePath);
    // console.log(config, '===mock.config.js===')
    // Mock.setup(config.settings) // mockjs 的 Mock.setup 方法目前仅支持浏览器端拦截
    lastTime = now;
  }

  const { requests = [], settings = { timeout: '10-100' }, subfiles } = config;
  const { timeout = '10-100' } = settings;

  if (subfiles) {
    subfiles.forEach((v) => {
      delete require.cache[require.resolve(v)];
      requests.push(...require(v).requests);
    });
  }

  const existed = requests.some(({ type = 'GET', url, tpl, handle }) => {
    if (type.toUpperCase() !== method.toUpperCase()) return false;
    if (url instanceof RegExp && !url.test(path)) return false;
    if (!(url instanceof RegExp) && new URLPattern(url).match(path) === null)
      return false;
    // if (!(url instanceof RegExp) && url !== path) return false;

    const finalTimeout = Mock.mock({ [`timeout|${timeout}`]: 0 }).timeout;
    setTimeout(() => {
      if (handle) {
        handle(req, res);
      } else {
        res.json(Mock.mock(tpl));
      }
    }, finalTimeout);

    return true;
  });

  if (!existed) next();
};
