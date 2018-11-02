# Hyperledger Fabric Desktop

Hyperledger Fabric Desktop is a out-of-the-box desktop which is for hyperledger fabric and aims to help people use
and manage blockchains in a more elegant and simple way.

## Main Features

1. Manage the lifecycle of chaincodes,aka,smart contract,eg.,`install/instantiate/query/invoke`.
2. Cross-platform，suitable for Windows,Mac,Linux.
3. Graphical user interface, easy to install, easy to use.
4. Users Keep the user's private key locally which Hyperledger Cello,Hyperledger Explorer can not implement.
5. Multiple functions,e.g.,Block Dashboard, Chaincode Install, Chaincode Invoke,etc.
6. Technology stack:Electron, React, Ant Design, Fabric-Node-sdk.

## Releases

- [package](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/releases)

- [source code](https://github.com/blockchain-desktop/hyperledger-fabric-desktop)

## Documentation, Getting Started and Develop Guideline

Please visit our online documentation for information on getting started your tutorial or developing with the desktop.

For beginners, it is highly recommended to read [index.md](doc/doc-En/index-En.md) first.

## Contributing

We welcome contributions to the Hyperledger Fabric project in many forms. There’s plenty to do! 

Check [CONTRIBUTING documentation](doc/doc-En/CONTRIUTING-EN.md)  for the full details.

## Getting in touch

- Anyone: For any problem and question, raise an [issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues) on github.
- Developer: For bug reports and feature requests, raise an [issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)
  and assign to yourself or someone else, close after finished.
- Maintainer: Process and coordinate the [issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues) and the [project](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/projects).

## License

Hyperledger fabric desktop source code files are made available under the GNU GENERAL PUBLIC LICENSE,
Version 3 (GPL-3), located in the [LICENSE](LICENSE) file. Hyperledger fabric desktop documentation 
files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), 
available at http://creativecommons.org/licenses/by/4.0/.

---

# 超级账本fabric客户端

* 产品定位：客户端为开箱即用的，跨平台的(适用Windows, Mac, Linux），超级账本（hyperledger fabric）的图形化界面
客户端。客户端主要解决了Hyperledger Cello、Hyperledger Explorer中用户私钥非用户留存的问题，将用户私钥留存用户本地，并具有数据看板、链码调用、链码安装等核心功能。
* 技术栈：Electron, React, Ant Design, Fabric-Node-sdk  

## 项目资源
- [项目地址](https://github.com/blockchain-desktop/hyperledger-fabric-desktop)  
- [软件包下载地址](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/releases)  

## 文档目录
* [使用者：功能介绍](doc/doc-Zn/tutorial-Zn.md)  
* [开发者：参与开发](doc/doc-Zn/coding-guidelines-Zn.md) 
* [开发者：贡献代码](doc/doc-Zn/CONTRIBUTING-Zn.md)   
* [项目架构](./doc/architect.md)  

## 如何参与？

1. 任何人：任何问题、开发事项，请在github提[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)
2. 开发者：交流处理[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)，
    确定处理人。开发完成后close issue。
3. 维护者：处理协调[issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)
    与[project](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/projects)
    的进展

## 开发路线
* v0.1.0 : 基础功能（数据看板、链码调用、链码安装）。
* v0.2.0 : 添加通道管理等功能。
* v0.3.0~: 逐步添加其他功能，逐步完善基础架构

客户端目前处于v0.1.0版本阶段。


