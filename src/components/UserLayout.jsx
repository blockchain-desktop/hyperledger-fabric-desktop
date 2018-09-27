// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout} from 'antd';
var write = require('../util/readAndWrite');

var cer;

const { Content } = Layout;

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peer: 'grpc://localhost:7051',
      cer:'',
      pri:''
    };


    this.onClick = this.onClick.bind(this);
    this.peerChange = this.peerChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);

  }

  peerChange(event){
    this.setState({peer: event.target.value})
  }


  onClick(e){
    var data = {
      isSign:true,
      peer:this.state.peer,
      cer:this.state.cer,
      pri:this.state.pri,
      path:'src/components/content/resources/key/'
    };
    var content = JSON.stringify(data);
    write.write(content,'config.json');
    this.props.onGetChildMessage(true);  // 调用父组件传来的函数，将数据作为参数传过去
  }

  cerImport(e){
    var selectedFile = document.getElementById("cerFiles").files[0];//获取读取的File对象
    var name = selectedFile.name;//读取选中文件的文件名
    var size = selectedFile.size;//读取选中文件的大小
    console.log("文件名:"+name+"大小："+size);

    var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
    reader.readAsText(selectedFile);//读取文件的内容

    reader.onload = function(){
      cer = JSON.parse(this.result);
      console.log(cer);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。
      write.write(this.result,'src/components/content/resources/key/' + cer["name"]);
    };
  }

  priImport(e){
    var selectedFile = document.getElementById("priFiles").files[0];//获取读取的File对象

    var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
    reader.readAsText(selectedFile);//读取文件的内容

    reader.onload = function(){
      console.log(this.result);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。
      write.write(this.result,'src/components/content/resources/key/' + cer["enrollment"]['signingIdentity'] + '-priv');
    };
    this.setState({cer:'src/components/content/resources/key/' + cer["name"]});
    this.setState({pri:'src/components/content/resources/key/' + cer["enrollment"]['signingIdentity'] + '-priv'});
  }


  render() {
    return (

        <Layout>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

              <div style={{ margin: '24px 0' }}>
                地址：
                <Input  type="text" value={this.state.peer} style={{ width: '70%'  }} onChange={this.peerChange}/>
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
