### 介绍

这是一个可以用配置文件，并支持热加载，来管理 `mockjs` 的中间件模块

### 安装

`npm i -D @andremao/mockjs-config`

### 使用

**_1_** 在项目的**根目录下**新建配置文件 `mock.config.js`，内容如下：

```javascript
const Mock = require('mockjs')

module.exports = [
  {
    type: 'post',
    url: '/user',
    tpl: {
      data: { id: '@id()', name: '@cname()', email: '@email()' },
      status: 200
    }
    // handle(req, res) {
    //   console.log(req.body, '==== post /user ====')
    //   const data = Mock.mock({
    //     data: { id: '@id()', name: '@cname()', email: '@email()' },
    //     code: 200
    //   })
    //   res.json(data)
    // }
  },
  {
    type: 'get',
    url: '/user/list',
    // tpl: {
    //   'data|1-10': [{ id: '@id()', name: '@cname()', email: '@email()' }],
    //   status: 200
    // }
    handle(req, res) {
      console.log(req.query, '==== get /user/list ====')
      const data = Mock.mock({
        'data|1-10': [{ id: '@id()', name: '@cname()', email: '@email()' }],
        code: 200
      })
      res.json(data)
    }
  }
]
```

补充：

- `mock.config.js` 文件名必须一致，且必须在**项目根目录下**
- `tpl` 请参照 [mockjs](http://mockjs.com/) 的 `template` 格式
- `handle` 的优先级高于 `tpl`，配置了 `handle` 就会忽略 `tpl`

**_2_** 在 vue 中使用，修改 `vue.config.js` 配置文件：

```javascript
module.exports = {
  devServer: {
    before(app) {
      if (process.env.NODE_ENV.toUpperCase() === 'DEVELOPMENT') {
        app.use(require('body-parser').json()) // 把 post 请求参数解析为 json 格式
        app.use(require('@andremao/mockjs-config')) // 挂上中间件
      }
    }
  }
}
```

**_3_** 重启项目即可，并支持热加载，后续改动 `mock.config.js` 文件无需重启
