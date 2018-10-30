// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Icon } from 'antd';
import getFabricClientSingleton from '../util/fabric';
import { getConfigDBSingleton } from '../util/createDB';


const path = require('path');
const fs = require('fs');

const logger = require('electron-log');

const db = getConfigDBSingleton();

const { Content } = Layout;

const bcgd = path.join(__dirname, '../../resources/styles/image/blc.jpg');

// const styles = path.join(__dirname,'content/styles/css/UserLayoutCss.css');

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peerGrpcUrl: 'grpc://localhost:7051',
      peerEventUrl: 'grpc://localhost:7053',
      ordererUrl: 'grpc://localhost:7050',
      username: 'Org1Admin',
      certPath: '',
      keyPath: '',
      certlabel: '  choose a certificate ',
      keylabel: ' choose a privary key',
    };


    this.onClick = this.onClick.bind(this);
    this.peerGrpcUrlChange = this.peerGrpcUrlChange.bind(this);
    this.peerEventUrlChange = this.peerEventUrlChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.usernameChange = this.usernameChange.bind(this);
  }


  onClick() {
    const data = {
      isSign: true,
      peerGrpcUrl: this.state.peerGrpcUrl,
      peerEventUrl: this.state.peerEventUrl,
      ordererUrl: this.state.ordererUrl,
      username: this.state.username,
      path: 'resources/key/',
    };
    const content = JSON.stringify(data);
    fs.writeFileSync(path.join(__dirname, '../../config.json'), content);
    db.update({ id: 0 },
      { $set: { isSign: true,
        peerGrpcUrl: this.state.peerGrpcUrl,
        peerEventUrl: this.state.peerEventUrl,
        ordererUrl: this.state.ordererUrl,
        username: this.state.username,
        path: 'resources/key/' } },
      {}, () => {
      });
    this.props.onGetChildMessage(true);
    const fc = getFabricClientSingleton();
    logger.info(this.state.certPath);
    fc.importCer(this.state.keyPath, this.state.certPath);
  }

  peerGrpcUrlChange(event) {
    this.setState({ peerGrpcUrl: event.target.value });
  }

  peerEventUrlChange(event) {
    this.setState({ peerEventUrl: event.target.value });
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
      display: 'block',
      position: 'absolute',
      minHeight: '900px',
      backgroundImage: 'url(' + bcgd + ')',
    };
    const contentStyle = {
      padding: '40px 26px 30px 26px',
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
    };
    const fontStyle = {
      fontSize: '38px',
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
      width: '200px',
      height: '32px',
      verticalAlign: 'middle',
      textAlign: 'center',
      lineHeight: '30px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      padding: '0 9px',
    };
    const spanStyle = {
      display: 'inlineBlock',
      fontSize: '1.2em',
    };
    const InputStyle = {
      width: '200px',
      display: 'block',
      float: 'right',
    };
    const firstDivStyle = {
      margin: '10px 8px 27px 8px',
    };
    const divStyle = {
      margin: '27px 8px',
    };
    const lastDivStyle = {
      margin: '32px 8px',
    };
    const buttonStyle = {
      width: '100%',
    };
    return (
      <Layout style={LayoutStyle}>

        <div style={backgroundStyle} />

        <div style={contentStyle}>
          <Content>
            <div style={LoginStyle}>
              <span style={fontStyle}>Fabric Desktop</span>
            </div>

            <div style={firstDivStyle}>
              <span style={spanStyle}> peer grpc url：</span>
              <Input type="text" style={InputStyle} value={this.state.peerGrpcUrl} onChange={this.peerGrpcUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>peer event url：</span>
              <Input type="text" style={InputStyle} value={this.state.peerEventUrl} onChange={this.peerEventUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>orderer url:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererUrl} onChange={this.ordererChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>username:</span>
              <Input type="text" style={InputStyle} value={this.state.username} onChange={this.usernameChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>certificate：</span>
              <input type="file" id="cerFiles" name="cerFiles" style={cerfileStyle}onChange={this.cerImport} />
              <label htmlFor="cerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.certlabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>private key：</span>
              <input type="file" id="priFiles" name="priFiles" style={prifilesStyle} onChange={this.priImport} />
              <label htmlFor="priFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.keylabel}</label>
            </div>
            <div style={lastDivStyle}>
              <Button type="primary" style={buttonStyle} onClick={this.onClick}>登录</Button>
            </div>
          </Content>
        </div>
      </Layout>

    );
  }
}
