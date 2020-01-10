### 安装

`npm i @andremao/mockjs-config`

### 使用

在项目的**根目录下**新建配置文件 `mock.config.js`，内容如下：

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
  },
  {
    type: 'get',
    url: '/user/list',
    tpl: {
      'data|10': [{ id: '@id()', name: '@cname()', email: '@email()' }],
      status: 200
    },
    handle(req, res) {
      console.log(req.path, req.method, req.query, req.body, '====get user====')
      const data = Mock.mock({ data: [], code: 200 })
      res.json(data)
    }
  }
]
```

补充：

- `mock.config.js` 文件名必须一致，且必须在**项目根目录下**
- `tpl` 请参照 mock 的 `template` 格式
- `handle` 的优先级高于 `tpl`，配置了 `handle` 就会忽略 `tpl`
