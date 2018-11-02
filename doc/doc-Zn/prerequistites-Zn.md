# 安装开发环境

## 安装源代码

如果您不清楚如何安装源代码和客户端，您可参考[setup](setup-Zn.md)文档。

## 安装Docker和Docker Compose

安装与操作系统对应的Docker和Docker Compose:
* MacOS, *nix, or Windows 10: 17.06.2-ce及以上版本
* 旧版本的Windows: 安装Docker Toolbox 17.06.2-ce及以上版本

安装Docker时会自动安装Docker Compose,如果您已经安装过Docker,您需要确保您安装的
Docker Compose为1.14.0及以上版本。

您可打开终端，输入以下命令检查您已经安装的Docker和Docker Compose.

```bash
docker --version

docer-compose --version
```

## 安装Node.js和NPM

客户端通过Hyperledger fabric的Node SDK和fabric网络交互，你需要保证您已经安装过8.9.x及以上版本的Node.js

> Note!
> 不支持9.x版本的Node.js

安装Node.js时会自动安装NPM,建议您安装5.6.0版本的NPM，您可通过
```bash
npm install npm@5.6.0 -g
```
升级到指定版本的NPM。

## 安装IDE工具

- [WebStorm](https://www.jetbrains.com/webstorm/) 或 [VSCode](https://code.visualstudio.com)

## 安装依赖项及环境变量

开发技术栈：Electron, React, Ant Design, Fabric-Node-sdk

我们已经将需要安装的技术栈配置在`package.json`文件里，直接在项目根目录下运行命令
```
  npm install
```
即可，但因为国内网络的限制，在安装时会出现进度停滞的现象，解决方法请见[Desktop-FAQ](Desktop-FAQ-Zn.md)。

如果您将要操作的链码文件是Go语言类型，你需要设置`GOPATH`环境变量，如在linux平台下，你可以在`〜/.bashrc`文件中进行配置。

安装完成后，在项目根目录下，运行命令
```bash
npm start
```
即可启动客户端，并查看运行效果。
