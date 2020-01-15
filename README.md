### 介绍

这是一个支持热加载配置文件结合 `webpack devServer` 来管理 `mockjs` 的中间件模块

### 安装

`npm i -D @andremao/mockjs-config`

### 使用

**_1_** 在项目的**根目录下**新建配置文件 `mock.config.js`，内容如下：

```javascript
const Mock = require('mockjs')
const path = require('path')

module.exports = {
  // 多人开发时，分子文件，子文件内容格式参考下面补充
  subfiles: [
    path.join(__dirname, './some/path/to/subfile1.js'),
    path.join(__dirname, './some/path/to/subfile2.js')
  ],
  // 要被 mockjs 拦截的请求集
  requests: [
    {
      type: 'GET',
      url: '/user/list',
      // 数据模板，请参照 mockjs
      tpl: {
        code: 200,
        message: '获取用户列表成功',
        'data|1-10': [{ id: '@ID()', name: '@CNAME()', email: '@EMAIL()' }]
      }
      // 自定义响应数据函数，优先级高于 tpl，需要自己手动调用 res 响应对象的 api 返回响应数据
      // handle(req, res) {
      //   console.log(req.query, '==== GET /user/list ====')
      //   const data = Mock.mock({
      //     code: 200,
      //     message: '获取用户列表成功',
      //     'data|1-10': [{ id: '@ID()', name: '@CNAME()', email: '@EMAIL()' }]
      //   })
      //   res.json(data)
      // }
    },
    {
      type: 'GET',
      url: /^\/user\/\d+$/, // 支持正则表达式
      // 数据模板，请参照 mockjs
      // tpl: {
      //   code: 200,
      //   message: '获取用户信息成功',
      //   data: { id: '@ID()', name: '@CNAME()', email: '@EMAIL()' }
      // }
      // 自定义响应数据函数，优先级高于 tpl，需要自己手动调用 res 响应对象的 api 返回响应数据
      handle(req, res) {
        console.log(req.query, '==== GET /user/:id ====')
        console.log(req.path) // 若想要获取 地址中的 :id 参数，请自己手动解析
        const data = Mock.mock({
          code: 200,
          message: '获取用户信息成功',
          data: { id: '@ID()', name: '@CNAME()', email: '@EMAIL()' }
        })
        res.json(data)
      }
    }
  ],
  // 参考 Mock.setup 配置项，目前仅支持 timeout，默认值：'10-100'
  settings: { timeout: '10-100' }
}
```

补充：

- `mock.config.js` 文件名必须一致，且必须在**项目根目录下**
- `tpl` 请参照 [mockjs](http://mockjs.com/) 的 `template` 格式
- `handle` 的优先级高于 `tpl`，配置了 `handle` 就会忽略 `tpl`
- `./some/path/to/subfile1.js`、`./some/path/to/subfile2.js` 子文件内容如下：

  ```javascript
  module.exports = {
    requests: [
      {
        type: 'get',
        url: '/user/list',
        tpl: { ... }
      },
      ...
    ]
  }
  ```

**_2_** 在 vue 中使用，修改 `vue.config.js` 配置文件：

```javascript
module.exports = {
  devServer: {
    before(app) {
      // 判断是否为开发环境
      if (process.env.NODE_ENV.toUpperCase() === 'DEVELOPMENT') {
        // 如果需要获取到 post 请求参数，把下面这行代码的注释解开
        // app.use(require('body-parser').json()) // 把 post 请求参数解析为 json 格式
        app.use(require('@andremao/mockjs-config')) // 挂上中间件
      }
    }
  }
}
```

**_3_** 重启项目即可，并支持热加载，后续改动 `mock.config.js` 文件无需重启
