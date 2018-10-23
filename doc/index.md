# 主文档

## 快速入门
TODO: 介绍客户端的使用

### 项目结构
- doc 项目文档
- fabric 后端网络配置相关文件
  - basic-network 基本网络配置文件
  - chaincode 链码相关文件
  - fabcar  链码操作脚本文件
- resources 客户端资源文件  
- src    前端客户端主要文件
  - components 前端客户端界面文件
  - util 链码调用接口文件
  
### 运行环境 
后端网络、证书为客户端运行的基本环境，如运行客户端，则先启动后端网络和获取相关证书
#### 启动后端fabric网络

##### 启动网络
```bash
cd ../fabric/fabcar
./startFabric.sh
``` 
##### 获取证书(此步可跳过) 
启动后，获取证书 
```bash
cd ../fabric/fabcar
node enrollAdmin.js
node registerUser.js
```
注：
生成的证书应置于`fabric/fabcar/hfc-key-store`目录下。
目前，已在`src/components/content/resources/hfc-key-store`放置有效证书，
故只需启动网络即可使用，无需获取CA证书并放置相关目录下。

因网络根证书不会变化，所以git仓库中保存的证书可以使用，克隆项目到本地后，可直接启动网络，不需要进行证书相关操作。

### 关闭网络
关闭客户端后，可关闭后端网络
```bash
cd ../fabric/basic-network
./stop.sh
```    
### 参与开发

#### 开发环境必备条件：
* node.js：8.9.x 版本及以上，推荐8.x.x最新LTS版本 (9版本及以上暂不支持)
* docker：17.06.2-ce 版本及以上
* docker-compose：1.14.0 版本及以上

开发技术栈：Electron, React, Ant Design, Fabric-Node-sdk  
推荐IDE：WebStorm、VSCode

#### 开发客户端功能:
使用网络、证书作为开发环境，进行electron项目的功能开发。

### 代码检查
提交代码前请先用`npm run lint` 对代码进行检查，
修改代码规范的问题（`npm run lintFix [代码地址]` 命令可对代码一些问题进行自动修复）


[附加说明可参考hyperledger fabric官方文档](https://hyperledger-fabric.readthedocs.io/en/release-1.1/write_first_app.html)  



