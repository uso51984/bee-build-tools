## bee-build-tools
集成webpack bable eslint webpack-dev-server工具及依赖

### webpack-dev-server 使用
##### 引用配置
```
const getwebpackDevConfig =  require('bee-build-tools/lib/getwebpackDevConfig')

module.exports = getwebpackDevConfig({});
```
##### 启动
```
"scripts": {
"dev": "webpack-dev-server --config ./webpack.dev.js",
}
```
> 默认读取examples 目录下 *.js index.html


### dist
webpack 编译
```
  "scripts": {
    "dist": "bee-tools run dist --babel-runtime",
  }
```
###### 配置entry
package.json 文件

```
  "config": {
    "entry": {
      "rc-fab-button": [
        "./src/index.js"
      ]
    }
  }
```

### compile
bable 编译 src/*
```
 "scripts": {
    "compile": "bee-tools run compile --babel-runtime",
  }

```

### 其他
```
 "scripts": {
    "lint": "bee-tools run js-lint",  ## eslint
    "gh-pages": "bee-tools run gh-pages", ## 发布github pages
    "buildExample": "bee-tools run buildExample" ## 编译buildExample
  },
```
