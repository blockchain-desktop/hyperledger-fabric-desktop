### 项目结构
- test 测试代码
- doc 项目文档
- fabric 后端网络
  - basic-network 网络配置
  - chaincode 链码文件
  - fabcar  操作脚本
- resources 静态资源  
- src    客户端
  - components 客户端界面
  - util 链码接口
- out  客户端程序

### 配置文件

在项目根目录下，会存在`.eslintrc` 、`.package.json`等配置文件，一般情况下，您不需要付出额外的精力
去注意它，当您需要安装依赖项时，
```bash
npm install

```
会自动引入新的外来库并自动修改配置文件，除非遇到特殊的情况，否则您不需要手动修改这些配置文件。
  
