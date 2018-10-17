# 开发者文档
## 快速入门
1. 预览
2. 客户端尝试
3. 项目代码
4. 如何开发
5. 如何贡献你的代码

### 1. 预览
客户端为开箱即用的，跨平台的(适用Windows, Mac, Linux），超级账本（hyperledger fabric）的图形化界面客户端。
客户端主要解决了Hyperledger Cello、Hyperledger Explorer中用户私钥非用户留存的问题，将用户私钥留存用户本地，并具有数据看板、链码调用、链码安装等核心功能。

### 2. 客户端尝试
1. 用户登录
2. 数据看板
3. 链码调用
4. 链码安装

#### 2.1 用户登录
输入peer url，orderer url，username，并选择用户证书文件和私钥文件后，点击登录。

<图片>
#### 2.2 数据看板
在数据看板中，我们可以看到区块相关信息。


<图片>
#### 2.3 链码调用
在链码调用界面中，输入通道名称、智能合约、函数名称、参数并选择是查询还是调用操作后，点击发送按钮，可获得相关返回信息。

<图片>
#### 2.4 链码安装
在链码安装页面里，我们可以查看已经添加的各个智能合约的状态，是处于已经安装还是已经部署，并且我们可以添加新的智能合约，输入链码名称、版本号、通道名称、链码文件路径和功能描述，点击添加按钮，即可添加新的智能合约窗口，并在新的智能合约窗口中进行相关智能合约操作。

<图片>
### 3. 项目代码
#### 3.1 项目架构
- doc   项目文档
- fabric  后端网络配置相关文件
  - basic-network  基本网络配置文件
  - chaincode  链码相关文件
  - fabcar  链码操作脚本文件
- src     前端客户端相关文件
  - components    开发前端客户端主要文件
  - util 链码调用接口文件

#### 3.2 配置文件

也许你已经注意到了，在项目根目录下，会存在`.eslintrc` 、`.package.json`等配置文件下，一般情况下，你不需要额外去注意它，但当你引入新的外来库文件时，你可以手工修改或者通过类似`npm install --save`的命令自动引入新的外来库并自动修改配置文件，当然了，我们不推荐手动去改，因为那样容易出错。

### 4. 如何开发

#### 4.1 开发环境必备条件：
* node.js：8.9.x 版本及以上，推荐8.x.x最新LTS版本 (9版本及以上暂不支持)
* docker：17.06.2-ce 版本及以上
* docker-compose：1.14.0 版本及以上

开发技术栈：Electron, React, Ant Design, Fabric-Node-sdk  
推荐开发IDE：WebStorm 或 VSCode

#### 4.2 安装依赖项
在开发客户端时，在本地机上需要安装一些依赖项，如安装Electron、Eslint等，我们已经将需要安装的依赖项都已配置在`package.json`文件里，因此直接在项目根目录下运行`npm install`命令即可安装相关依赖项。

#### 4.3 遵守代码规范
我们采取了ESlint规范，并力求代码完全满足ESlint规范，但是在一些情况下，我们适当地放宽了ESlint规范的要求，目前，我们在两个地方放宽了对ESLint规范的要求。

1.我们按照Python的强制规范，允许在命名函数时，使用下划线_作为区分函数是公有函数还是私有函数，如果函数名前存在下划线_则认为是私有函数，如无，则默认为共有函数。

2.如果一个`.jsx`文件中需要用到多个组件(class)的话，多个组件耦合度较大，且多个组件不需要考虑复用的情况下，我们放开了eslint（代码规范约束）对一个`.jsx`文件最多只有一个组件(class）的约束，你可以在一个`.jsx`文件中声明多个组件(class)。

此外，如果你在开发的过程中，遇到了ESlint规范约束不恰当的情况下，注意，确实是ESlint规范约束不恰当，而不是为了可以偷个懒不 去修改代码中存在的不规范的地方，可以请在github上提出[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)，在被接受后，可以考虑放开此ESlint规范约束。

#### 4.3 开发参考范例
我们将以如何开发通道管理功能为例来介绍如何开发我们的功能，如果你想参与开发，那么就一起来学习开发的流程吧！如果你愿意把通道管理功能做成一个单独的界面的话，那么开发流程可参考以下几个步骤：
1. 开发通道管理界面，我们可以把这个文件命名为`ChannelManageContent.jsx`
2. 开发通道管理接口，我们推荐在`fabric.js`中声明一个`ChannelManage`的函数
3. 如果通道管理功能需要数据持久化的话，我们需要新建一个NEDB数据库来完成持久化。

#### 4.3.1 开发通道管理界面

在`src/components/content`目录下，你可以新建一个`ChannelManageContent.jsx`文件。新建文件后，并在`src/components/BasicLayout.jsx`增加相应的内容路由。

我们推荐react的es6语法来完成前端界面的书写，推荐的组件书写方式：

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
如果一个页面中需要用到多个组件(class)的话，且多个组件不需要考虑复用的情况下，我们放开了eslint（代码规范约束）对一个`.jsx`文件最多只有一个组件(class）的约束，你可以在一个`.jsx`文件中声明多个组件(class)，但注意,多个组件(class)并存的话，一个`.jsx`文件只能export default 唯一的全局组件(class)。

 除以上放开的eslint约束，即一个`.jsx`文件可以有多个组件(class)，你需要保证你的代码满足其余所有的eslint约束。

#### 4.3.2 开发通道管理接口
你可以另建一个文件，如`channel.js`来开发通道管理相关接口，但我们推荐可以把通道管理作为一个函数写进`src/util`目录下的`fabric.js`文件中，在`fabric.js`中，有查询链码、调用链码、安装链码、实例化链码等功能函数，所以我们推荐你将通道管理接口封装成一个函数。

#### 4.3.3 提交代码前注意检查代码规范
在你提交代码前请先用`npm run lint` 对代码进行检查，
并且可以用`npm run lintFix ` 命令可对代码存在的一些规范性问题进行自动修复。

此外，可能还存在一些不能自动修复的问题，这时候你就需要根据IDE的提示，进行手工修复了。注意，IDE提示时，如果显示是JShint或者JSlint的话，那么你需要设置IDE的代码质量工具，如在webstorm中需设置Code Quality Tools为ESlint,并禁用其他代码质量工具。

#### 4.4 开发路线
* v0.1.0 : 基础功能（数据看板、链码调用、链码安装）。
* v0.2.0：开发通道相关功能，并完善基础功能和架构。
* v0.3.0~: 逐步添加其他功能，逐步完善基础架构

客户端目前处于v0.1.0版本阶段。

### 5. 如何贡献你的代码

1. 任何人：任何问题、开发事项，请在github提[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)
2. 开发者：交流处理[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)，
    确定处理人。开发完成后close issue。
3. 维护者：处理协调[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)
    与[project](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/projects)
    的进展

目前,我们依托于Github进行客户端的开发和维护工作，如果你想贡献你的代码，那么恭喜你，你不需要额外申请账号和学习其他工具，你可以直接贡献你的代码啦，不过这个前提是，你得拥有Github相关使用知识，不过我们相信，这对一个开发者来说并不是一个问题。
