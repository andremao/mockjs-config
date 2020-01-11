const Mock = require('mockjs')
const path = require('path')
const fs = require('fs')

const projRootPath = process.cwd()
// console.log(projRootPath, 'projRootPath')

const configFilePath = path.join(projRootPath, 'mock.config.js')
// console.log(configFilePath, 'configFilePath')

if (!fs.existsSync(configFilePath)) {
  console.log('\r\n', new Error(`Cannot find file "${configFilePath}"`))
  module.exports = (req, res, next) => next()
  return
}

let config = require(configFilePath)
let lastTime = Date.now()

module.exports = (req, res, next) => {
  const now = Date.now()
  // console.log('now - lastTime:', now - lastTime)
  if (now - lastTime > 3000) {
    delete require.cache[require.resolve(configFilePath)]
    config = require(configFilePath)
    // console.log(config, '===mock.config.js===')
    // Mock.setup(config.settings) // mockjs 的 Mock.setup 方法目前仅支持浏览器端拦截
    lastTime = now
  }

  const { requests, settings = { timeout: '10-100' } } = config
  const { timeout = '10-100' } = settings

  if (!requests) {
    console.log('\r\n', new Error(`Miss option "requests" of mock.config.js`))
    return next()
  }

  const existed = requests.some(({ type = 'GET', url, tpl, handle }) => {
    if (type.toUpperCase() === req.method.toUpperCase() && url === req.path) {
      const finalTimeout = Mock.mock({ [`timeout|${timeout}`]: 0 }).timeout
      setTimeout(() => {
        if (handle) {
          handle(req, res)
        } else {
          res.json(Mock.mock(tpl))
        }
      }, finalTimeout)
      return true
    }
  })

  if (!existed) next()
}
