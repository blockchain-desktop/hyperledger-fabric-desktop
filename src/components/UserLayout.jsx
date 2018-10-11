// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Upload} from 'antd';
import getFabricClientSingleton from "../util/fabric";

const fs = require('fs');

const { Content } = Layout;

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peerUrl:'grpc://localhost:7051',
      ordererUrl:'grpc://localhost:7050',
      username:'Org1Admin',
      certPath:'',
      keyPath:''
    };


    this.onClick = this.onClick.bind(this);
    this.peerChange = this.peerChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.usernameChange = this.usernameChange.bind(this);

  }


  peerChange(event){
    this.setState({peerUrl: event.target.value})
  }

  ordererChange(event){
    this.setState({ordererUrl: event.target.value})
  }

  usernameChange(event){
    this.setState({username: event.target.value})
  }


  onClick(e){
    const data = {
      isSign:true,
      peerUrl:this.state.peerUrl,
      ordererUrl:this.state.ordererUrl,
      username:this.state.username,
      path:'src/components/content/resources/key/'
    };
    const content = JSON.stringify(data);
    console.log(content);
    this.props.onGetChildMessage(true);  // 调用父组件传来的函数，将数据作为参数传过去
    fs.writeFileSync('config.json',content);
    const fc = getFabricClientSingleton();
    console.log(this.state.certPath);
    fc.importCer(this.state.keyPath,this.state.certPath);
  }

  cerImport(e){
    const selectedFile = document.getElementById("cerFiles").files[0];//获取读取的File对象
    this.setState({certPath: selectedFile.path})

  }



  priImport(e){
    const selectedFile = document.getElementById("priFiles").files[0];//获取读取的File对象
    this.setState({keyPath: selectedFile.path})
  }


  render() {
    return (

        <Layout>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

            <div style={{ margin: '24px 0' }}>
              &emsp;Peer地址：
              <Input  type="text" value={this.state.peerUrl} style={{ width: '70%'  }} onChange={this.peerChange}/>
            </div>

            <div style={{ margin: '24px 0' }}>
              Orderer地址：
              <Input  type="text" value={this.state.ordererUrl} style={{ width: '70%'  }} onChange={this.ordererChange}/>
            </div>

            <div style={{ margin: '24px 0' }}>
              &emsp;username：
              <Input  type="text" value={this.state.username} style={{ width: '70%'  }} onChange={this.usernameChange}/>
            </div>

            <div>
              证书：
              <Input type="file" id="cerFiles" style={{ width: '30%'  }} onChange={this.cerImport}/>
            </div>

            <div>
              私钥：
              <Input type="file" id="priFiles" style={{ width: '30%'  }} onChange={this.priImport}/>
            </div>

            <div style={{ margin: '24px 0' }}>
              <Button type="primary" style={{ width: '100%' }} onClick={this.onClick}>登录</Button>
            </div>

          </Content>
        </Layout>


    );
  }
}
