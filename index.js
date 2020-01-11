const Mock = require('mockjs')
const path = require('path')

const projRootPath = process.cwd()
// console.log(projRootPath, 'projRootPath')

const configFilePath = path.join(projRootPath, 'mock.config.js')
// console.log(configFilePath, 'configFilePath')

let config = require(configFilePath)
let lastTime = Date.now()

module.exports = (req, res, next) => {
  const now = Date.now()
  // console.log('now - lastTime:', now - lastTime)
  if (now - lastTime > 3000) {
    delete require.cache[require.resolve(configFilePath)]
    config = require(configFilePath)
    // console.log(config, '===mock.config.js===')
    lastTime = now
  }

  Mock.setup(config.settings)

  const existed = config.requests.some(v => {
    if (
      v.type.toUpperCase() === req.method.toUpperCase() &&
      v.url === req.path
    ) {
      if (v.handle) {
        v.handle(req, res)
      } else {
        res.json(Mock.mock(v.tpl))
      }
      return true
    }
  })

  if (!existed) next()
}
