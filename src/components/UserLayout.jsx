// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Icon } from 'antd';
import getFabricClientSingleton from '../util/fabric';
import { getConfigDBSingleton } from '../util/createDB';

const logger = require('electron-log');

const db = getConfigDBSingleton();

const { Content } = Layout;

const path = require('path');

const bcgd = path.join(__dirname,'content/styles/image/blc.jpg');

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peerUrl: 'grpc://localhost:7051',
      ordererUrl: 'grpc://localhost:7050',
      username: 'Org1Admin',
      certPath: '',
      keyPath: '',
      certlabel: 'choose a certificate',
      keylabel: 'choose a privary key',
    };

    this.onClick = this.onClick.bind(this);
    this.peerChange = this.peerChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.usernameChange = this.usernameChange.bind(this);
  }


  onClick() {
    db.update({ id: 0 },
      { $set: { isSign: true,
        peerUrl: this.state.peerUrl,
        ordererUrl: this.state.ordererUrl,
        username: this.state.username,
        path: 'src/components/content/resources/key/' } },
      {}, () => {
      });
    this.props.onGetChildMessage(true);
    const fc = getFabricClientSingleton();
    logger.info(this.state.certPath);
    fc.importCer(this.state.keyPath, this.state.certPath);
  }

  peerChange(event) {
    this.setState({ peerUrl: event.target.value });
  }

  cerImport() {
    const selectedFile = document.getElementById('cerFiles').files[0];// 获取读取的File对象
    this.setState({ certPath: selectedFile.path });
    const cerArray = selectedFile.path.split('/');
    this.setState({ certlabel: cerArray[cerArray.length - 1] });
  }


  priImport() {
    const selectedFile = document.getElementById('priFiles').files[0];// 获取读取的File对象
    this.setState({ keyPath: selectedFile.path });
    const priArray = selectedFile.path.split('/');
    this.setState({ keylabel: priArray[priArray.length - 1] });
  }

  ordererChange(event) {
    this.setState({ ordererUrl: event.target.value });
  }

  usernameChange(event) {
    this.setState({ username: event.target.value });
  }


  render() {
    const LayoutStyle = {
      maxHeight: '600px',
      maxWidth: '800px',
    };
    const backgroundStyle = {
      width: '400px',
      height: 'auto',
      minHeight: '900px',
      display: 'block',
      position: 'absolute',
      backgroundImage: 'url('+bcgd+')',
    };
    const contentStyle = {
      padding: '80px 26px',
      backgroundColor: '#fff',
      width: '400px',
      height: 'auto',
      minHeight: '900px',
      display: 'block',
      marginLeft: '400px',
    };
    const LoginStyle = {
      display: 'block',
      alignItems: 'center',
      padding: '24px 0',
      margin: '24px 0',
    };
    const cerfileStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1,
    };
    const prifilesStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1,
    };
    const labelStyle = {
      fontSize: '1.1em',
      border: '1px solid rgb(217, 217, 217)',
      borderRadius: '4px',
      display: 'block',
      float: 'right',
      width: '220px',
      height: '32px',
      verticalAlign: 'middle',
      textAlign: 'center',
      lineHeight: '30px',
    };
    const spanStyle = {
      display: 'inlineBlock',
      fontSize: '1.2em',
    };
    const InputStyle = {
      width: '220px',
      display: 'block',
      float: 'right',
    };
    return (
      <Layout style={LayoutStyle}>

        <div style={backgroundStyle} >
          <image src={bcgd} alt=" "/>
        </div>

        <div style={contentStyle}>
          <Content>
            <div style={{ LoginStyle }}>
              <span style={{ fontSize: '38px' }}>Fabric Desktop</span>
            </div>
            <div style={{ margin: '36px 8px 29px 8px' }}>
              <span style={spanStyle}>peer &thinsp;&thinsp;url:</span>
              <Input type="text" style={InputStyle} value={this.state.peerUrl} onChange={this.peerChange} />
            </div>
            <div style={{ margin: '29px 8px' }}>
              <span style={spanStyle}>orderer url:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererUrl} onChange={this.ordererChange} />
            </div>
            <div style={{ margin: '29px 8px' }}>
              <span style={spanStyle}>username:</span>
              <Input type="text" style={InputStyle} value={this.state.username} onChange={this.usernameChange} />
            </div>
            <div style={{ margin: '29px 8px' }}>
              <span style={spanStyle}>certificate：</span>
              <input type="file" id="cerFiles" name="cerFiles" style={cerfileStyle}onChange={this.cerImport} />
              <label htmlFor="cerFiles" style={labelStyle}><Icon type="upload" theme="outlined" />&thinsp;{this.state.certlabel} </label>
            </div>
            <div style={{ margin: '29px 8px' }}>
              <span style={spanStyle}>private key：</span>
              <input type="file" id="priFiles" name="priFiles" style={prifilesStyle} onChange={this.priImport} />
              <label htmlFor="priFiles" style={labelStyle}><Icon type="upload" theme="outlined" />&thinsp;{this.state.keylabel}</label>
            </div>
            <div style={{ margin: '32px 8px' }}>
              <Button type="primary" style={{ width: '100%' }} onClick={this.onClick}>登录</Button>
            </div>
          </Content>
        </div>
      </Layout>
    );
  }
}
