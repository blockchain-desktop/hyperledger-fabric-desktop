# 启动客户端

## 前提条件

如果您是普通用户，您需要确保已经有一个正在运行的fabric网络，这是我们使用客户端的前提条件！

如果您是开发者，我们已经为您提供了一个简单但功能完备的fabric网络，可作为你的开发和测试环境。

## 安装客户端

如果您是普通用户，下载与操作系统对应的[客户端](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/releases)，双击使用。

如果您是开发者，下载与操作系统对应的项目[源代码](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/releases)或者git clone到
您的本地仓库。

如果您对如何启动和关闭fabric网络不熟悉，可参考以下操作：

## 启动网络

在项目根目录下，进行如下操作,即可启动fabric网络:
```bash
cd fabric/fabcar
./startFabric.sh
``` 
## 关闭网络

在您不使用客户端时或者您想关闭fabric网络时，进行如下操作可关闭后端网络。但是，在您使用或开发的过程中，您的网络需处于运行状态，直到您的开发结束。
```bash
cd fabric/basic-network
./stop.sh
```    
