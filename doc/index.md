# 主文档

## 快速入门使用

## 参与开发
[详细说明请参考官方文档](https://hyperledger-fabric.readthedocs.io/en/release-1.1/write_first_app.html)

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

生成的证书位于`fabcar/hfc-key-store`


#### 1.2 关闭网络
```bash
cd ../fabric/basic-network
./stop.sh
```



### 2. 开发客户端功能
使用网络、证书作为开发环境，进行electron项目的功能开发。


