## bee-build-tools
集成webpack bable eslint webpack-dev-server工具及依赖

## 安装

```
npm i --save-dev bee-build-tools
```

### webpack-dev-server 使用
##### 引用配置
```
const webpackDevConfig =  require('bee-build-tools/lib/webpackDevConfig')

module.exports = webpackDevConfig;
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
#### 二、配置
###### config options

属性 | 说明 | 类型 | 默认值
| --- | --- | --- | --- |
| name | amd的挂载name | string |  package.json的name属性 |
| entry |webpack dist的entry| Object |null |
| server |dev server|object|`{port: 9700, entry: { index: [ './examples/index.jsx' ] }, htmlTemplatePath: 'bee-build-tools/lib/config/index.Template.html'}`|
>说明：
* `port`: 配置webpack-dev-server 端口
* `entry`: 配置webpack 入口文件
* `htmlTemplatePath`: 配置webpack html-webpack-plugin template 路径
### 命令说明
package.json 配置
```
"scripts": {
    "dist": "bee-tools run dist",
    "dev": "webpack-dev-server --config ./webpack.dev.js",
    "compile": "bee-tools run compile --babel-runtime",
    "buildExample": "bee-tools run buildExample",
    "gh-pages": "bee-tools run gh-pages",
    "release": "bee-tools run release"
  },
  "config": {
    "name": "createColResizable",
    "entry": {
      "resizable-columns-table": [
        "./src/index.js"
      ]
    },
    "server": {
      "htmlTemplatePath": "./examples/index.html",
      "port": 9200
    }
  },
```
1. `bee-tools run js-lint`：对代码进行eslint验证
2. `bee-tools run dist` ：利用webpack对lib代码进行编译压缩打包
3. `bee-tools run buildExample`:  利用webpack对examples打包
4. `bee-tools run gh-pages`:  发布 files to a gh-pages branch on GitHub
5. `bee-tools run css`： 对less进行编译输出
7. `bee-tools run compile`: 编译项目源码为 es或者lib模式
8. `bee-tools run release`: 打tag更新到git server端以及publish 到npmjs.com
9. `bee-tools run dev`:  webpack-dev-server 启动项目(终端log无颜色)
说明 `bee-tools run dev`: 如何在项目里面使用配置文件代替使用
