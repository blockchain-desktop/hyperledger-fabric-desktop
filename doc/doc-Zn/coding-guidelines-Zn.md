# 开发者文档

## 快速入门

1. 客户端尝试
2. 项目架构
3. 如何开发

### 1. 客户端尝试

如果您不清楚如何使用客户端，可参考[tutorial](tutorial-Zn.md)文档。

### 2. 项目架构

- [项目架构](architect-Zn.md)

### 3. 如何开发

1. 安装开发环境
2. 开发参考范例
3. 关于代码规范的说明
4. 开发路线

#### 3.1 安装开发环境

安装开发环境，请参考[安装开发环境](./prerequistites-Zn.md)

#### 3.2 开发参考范例
我们将以开发通道管理为例来介绍如何开发新的功能，如果您愿意让新的功能拥有一个单独的界面的话，那么开发过程可参考以下几个步骤：

1. 开发通道管理界面，这个文件命名为`ChannelManageContent.jsx`
2. 开发通道管理接口，我们推荐在`fabric.js`中声明`ChannelManage`的函数
3. 如果通道管理功能需要数据持久化的话，需要新建一个NEDB数据库。
4. 提交代码前注意检查代码规范

#### 3.2.1 开发通道管理界面

在`src/components/content`目录下，您可以新建一个`ChannelManageContent.jsx`文件。新建文件后，
并在`src/components/BasicLayout.jsx`增加相应的内容路由。

我们推荐使用react的es6语法来完成前端组件的书写：

```react
import React,{ Component } from 'react';

class MyComponent extends Component {
  render() {
    return (
      <div>ES6方式创建的组件</div>
    );
  }
}
```
如果一个页面中需要用到多个组件(class)的话，且多个组件耦合度较大，我们放开了eslint代码规范
对一个`.jsx`文件最多只有一个组件(class）的约束，您可以在一个`.jsx`文件中声明多个组件(class)。

#### 3.2.2 开发通道管理接口
您可以新建一个文件，如`channel.js`来开发通道管理功能接口，但我们推荐把通道管理作为一个函数写进
`src/util`目录下的`fabric.js`文件中。在`fabric.js`中，有查询链码、调用链码、安装链码、实例化链码等
功能函数。

#### 3.2.3 数据持久化

如果需要数据持持久化，我们可以新建一个NEDB数据库

```javascript
//Persistent datastore with automatic loading
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'path/to/datafile', autoload: true });
```
或者使用在`src/util/createDB.js`使用单例模式
```javascript
let chaincodeDB;
export function getChaincodeDBSingleton() {
  if (!chaincodeDB) {
    chaincodeDB = new Datastore({ filename: path.join(__dirname, '../../resources/persistence/chaincode.db'), autoload: true });
  }
  return chaincodeDB;
}
```

#### 3.2.4 提交代码前注意检查代码规范
在您提交代码前使用
```
npm run lint
``` 
对代码进行检查，并且可以用
```npm run lintFix``` 对代码存在的不规范进行自动修复。

或许还会存在一些不能自动修复的问题，这时候您就需要根据IDE的提示，进行手工修复。

>注意!<br/>
>使用IDE自动提示时，您需要设置IDE的代码质量工具为Eslint。

### 3.3 关于代码规范的说明

对于代码规范，我们采取了ESlint，并力求代码完全满足ESlint约束，但是在一些特殊情况下，我们适当地放宽了ESlint约束， 目前，
我们在两个地方放宽了ESLint规范的要求。

1.我们按照Python的强制规范，使用下划线_作为区分函数是公有函数还是私有函数，如果函数名前存在下划线_则认为是私有函数，
如无，则认为是共有函数。

2.如果一个.jsx文件中需要用到多个组件的话，且多个组件耦合度较大，我们放开了eslint
对一个.jsx文件最多只能声明一个组件的约束，您可以在一个.jsx文件中声明多个组件。

如果您在开发的过程中，遇到了ESlint约束需要被适当放宽的情况下，注意，确实是ESlint规范约束不恰当，
您可以在github上提出相关issue，在查明属实后，可放开此ESlint约束。

#### 3.4 开发路线
* v0.1.0 : 基础功能（数据看板、链码调用、链码安装）。
* v0.2.0 : 添加通道管理功能及其他功能。
* v0.3.0~: 逐步添加其他功能，逐步完善基础架构

客户端目前处于v0.1.0版本阶段。
