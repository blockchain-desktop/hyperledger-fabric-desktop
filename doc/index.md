# 主文档

## 快速入门使用
TODO: 介绍客户端的使用

## 系统架构
--doc 项目文档
--fabric 后端网络配置相关文件
  --basic-network 组织证书等配置文件
  --chaincode 链码相关文件
  --fabcar  链码操作脚本文件
--src    前端客户端相关文件
  --components 开发前端客户端主要文件
  --util 链码调用接口文件
    
## 参与开发

开发环境必备条件：
* node.js：8.9.x 版本及以上，推荐8.x.x最新LTS版本 (9版本及以上暂不支持)
* docker：17.06.2-ce 版本及以上
* docker-compose：1.14.0 版本及以上

开发技术栈：Electron, React, Ant Design, Fabric-Node-sdk

推荐IDE：WebStorm、VSCode

[附加说明可参考官方文档](https://hyperledger-fabric.readthedocs.io/en/release-1.1/write_first_app.html)  

### 1. 启动基础fabric网络  
#### 1.1 启动网络

启动
```bash
cd ../fabric/fabcar
./startFabric.sh
```

启动后，获取CA证书  
```bash
cd ../fabric/fabcar
node enrollAdmin.js
node registerUser.js
```

生成的证书位于`fabric/fabcar/hfc-key-store`。
目前已在
`src/components/content/resources/hfc-key-store`放置有效证书，
只需启动网络即可使用，无需获取CA证书并放置对应目录。
因网络根证书不会变化，所以git仓库中保存的证书可以使用。


#### 1.2 关闭网络
```bash
cd ../fabric/basic-network
./stop.sh
```

### 2. 开发客户端功能
使用网络、证书作为开发环境，进行electron项目的功能开发。


