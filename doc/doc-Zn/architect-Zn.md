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
- out  打包客户端后的程序文件
### 配置文件

在项目根目录下，会存在`.eslintrc` 、`.package.json`等配置文件，一般情况下，您不需要付出额外的精力
去注意它，当您需要安装依赖项时，
```bash
npm install

```
会自动引入新的外来库并自动修改配置文件，除非遇到特殊的情况，否则您不需要手动修改这些配置文件。
  
