// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Icon, message } from 'antd';
import getFabricClientSingleton from '../util/fabric';
import { getConfigDBSingleton } from '../util/createDB';


const ButtonGroup = Button.Group;
const path = require('path');

const logger = require('electron-log');

const db = getConfigDBSingleton();

const { Content } = Layout;

const bcgd = path.join(__dirname, '../../resources/styles/image/blc.jpg');

export default class UserLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peerGrpcUrl: 'grpcs://139.198.122.54:7051',
      peerEventUrl: 'grpcs://139.198.122.54:7053',
      ordererUrl: 'grpcs://139.198.122.54:7050',
      mspid: 'Org1MSP',
      certPath: '',
      keyPath: '',
      tlsPeerPath: '',
      tlsOrdererPath: '',
      sslTarget: 'peer0.org1.example.com',
      certlabel: '  choose a certificate ',
      keylabel: ' choose a private key',
      tlsPeerLabel: ' choose a tls peer key',
      tlsOrdererLabel: 'choose a tls orderer key',
      Common: localStorage.getItem('language') === 'cn' ? require('../common/common_cn') : require('../common/common'),
    };

    this.onClick = this.onClick.bind(this);
    this.peerGrpcUrlChange = this.peerGrpcUrlChange.bind(this);
    this.peerEventUrlChange = this.peerEventUrlChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);
    this.tlsPeerImport = this.tlsPeerImport.bind(this);
    this.tlsOrdererImport = this.tlsOrdererImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.mspidChange = this.mspidChange.bind(this);
    this.sslTargetChange = this.sslTargetChange.bind(this);
    this.changeLangtoEn = this.changeLangtoEn.bind(this);
    this.changeLangtoCn = this.changeLangtoCn.bind(this);
  }

  onClick() {
    db.update({ id: 0 },
      { $set: { peerGrpcUrl: this.state.peerGrpcUrl,
        peerEventUrl: this.state.peerEventUrl,
        ordererUrl: this.state.ordererUrl,
        mspid: this.state.mspid,
        tlsPeerPath: this.state.tlsPeerPath,
        tlsOrdererPath: this.state.tlsOrdererPath,
        sslTarget: this.state.sslTarget,
        path: 'resources/key/users/' } },
      {}, () => {
      });
    getFabricClientSingleton().then((fabricClient) => {
      fabricClient.importCer(this.state.keyPath, this.state.certPath).then((result) => {
        db.update({ id: 0 },
          { $set: { isSign: 2 } },
          {}, () => {
          });
        this.props.onGetChildMessage(2);
        logger.info('result', result);
      }, () => {
        message.error(this.state.Common.ERROR.certificateFailed);
      });
    });

    logger.info(this.state.certPath);
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

  tlsPeerImport() {
    const selectedFile = document.getElementById('tlsPeerFiles').files[0];// 获取读取的File对象
    this.setState({ tlsPeerPath: selectedFile.path });
    const tlsArray = selectedFile.path.split('/');
    this.setState({ tlsPeerLabel: tlsArray[tlsArray.length - 1] });
  }

  tlsOrdererImport() {
    const selectedFile = document.getElementById('tlsOrdererFiles').files[0];// 获取读取的File对象
    this.setState({ tlsOrdererPath: selectedFile.path });
    const tlsArray = selectedFile.path.split('/');
    this.setState({ tlsOrdererLabel: tlsArray[tlsArray.length - 1] });
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

  mspidChange(event) {
    this.setState({ mspid: event.target.value });
  }

  sslTargetChange(event) {
    this.setState({ sslTarget: event.target.value });
  }

  changeLangtoEn() {
    localStorage.setItem('language', 'en');
    this.setState({ Common: require('../common/common') });
  }
  changeLangtoCn() {
    localStorage.setItem('language', 'cn');
    this.setState({ Common: require('../common/common_cn') });
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
      padding: '30px 26px 30px 26px',
      backgroundColor: '#fff',
      width: '400px',
      height: 'auto',
      minHeight: '900px',
      display: 'block',
      marginLeft: '400px',
    };
    const languageStyle = {
      position: 'absolute',
      right: '10px',
      top: '10px',
    };
    const buttonGroupStyle = {
      backgroundColor: 'transparent',
      borderStyle: 'none',
      outline: 'none',
    };
    const LoginStyle = {
      display: 'block',
      alignItems: 'center',
      padding: '10px 0',
    };
    const fontStyle = {
      fontSize: '38px',
    };
    const fileStyle = {
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
      margin: '10px 8px 20px 8px',
    };
    const divStyle = {
      margin: '20px 6px',
    };
    const lastDivStyle = {
      margin: '32px 6px',
    };
    const buttonStyle = {
      width: '100%',
    };
    const asteriskStyle = {
      float: 'left',
      color: '#ff0000',
    };
    return (
      <Layout style={LayoutStyle}>

        <div style={backgroundStyle}>
          <image src={bcgd} alt=" background image" />
        </div>

        <div style={contentStyle}>
          <Content>
            <div style={languageStyle}>
              <ButtonGroup>
                <Button style={buttonGroupStyle} onClick={this.changeLangtoEn}>En</Button>
                <Button style={buttonGroupStyle} onClick={this.changeLangtoCn}>Ch</Button>
              </ButtonGroup>
            </div>
            <div style={LoginStyle}>
              <span style={fontStyle}>Fabric Desktop</span>
            </div>

            <div style={firstDivStyle}>
              <span style={asteriskStyle}>*</span>
              <span style={spanStyle}> peer grpc url：</span>
              <Input type="text" style={InputStyle} value={this.state.peerGrpcUrl} onChange={this.peerGrpcUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*</span>
              <span style={spanStyle}>peer event url：</span>
              <Input type="text" style={InputStyle} value={this.state.peerEventUrl} onChange={this.peerEventUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*</span>
              <span style={spanStyle}>orderer url:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererUrl} onChange={this.ordererChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*</span>
              <span style={spanStyle}>msp id:</span>
              <Input type="text" style={InputStyle} value={this.state.mspid} onChange={this.mspidChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*</span>
              <span style={spanStyle}>certificate：</span>
              <input type="file" id="cerFiles" name="cerFiles" style={fileStyle}onChange={this.cerImport} />
              <label htmlFor="cerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.certlabel} </label>
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*</span>
              <span style={spanStyle}>private key：</span>
              <input type="file" id="priFiles" name="priFiles" style={fileStyle} onChange={this.priImport} />
              <label htmlFor="priFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.keylabel}</label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>tls peer key：</span>
              <input type="file" id="tlsPeerFiles" name="tlsPeerFiles" style={fileStyle} onChange={this.tlsPeerImport} />
              <label htmlFor="tlsPeerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsPeerLabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>tls orderer key：</span>
              <input type="file" id="tlsOrdererFiles" name="tlsOrdererFiles" style={fileStyle} onChange={this.tlsOrdererImport} />
              <label htmlFor="tlsOrdererFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsOrdererLabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>ssl target:</span>
              <Input type="text" style={InputStyle} value={this.state.sslTarget} onChange={this.sslTargetChange} />
            </div>
            <div style={lastDivStyle}>
              <Button type="primary" style={buttonStyle} onClick={this.onClick}>{this.state.Common.LOGIN}</Button>
            </div>
          </Content>
        </div>
      </Layout>

    );
  }
}
