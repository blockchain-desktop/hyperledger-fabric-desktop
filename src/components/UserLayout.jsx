// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Icon, message } from 'antd';
import getFabricClientSingleton from '../util/fabric';
import { getConfigDBSingleton } from '../util/createDB';


const ButtonGroup = Button.Group;
const path = require('path');
const yaml = require('js-yaml');
const fs   = require('fs');
const logger = require('electron-log');

const db = getConfigDBSingleton();

const { Content } = Layout;

const bcgd = path.join(__dirname, '../../resources/styles/image/blc.jpg');

export default class UserLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peerGrpcUrl: 'grpcs://localhost:7051',
      peerEventUrl: 'grpcs://localhost:7053',
      ordererUrl: 'grpcs://localhost:7050',
      mspid: 'Org1MSP',
      certPath: '',
      keyPath: '',
      tlsPeerPath: '',
      tlsOrdererPath: '',
      peerSSLTarget: 'peer0.org1.example.com',
      ordererSSLTarget: 'orderer.example.com',
      certlabel: '  choose a certificate ',
      keylabel: ' choose a private key',
      tlsPeerLabel: ' choose a peer tls ca cert',
      tlsOrdererLabel: 'choose a orderer tls ca cert',
      Common: localStorage.getItem('language') === 'cn' ? require('../common/common_cn') : require('../common/common'),
    };

    this.onClick = this.onClick.bind(this);
    this.configImport = this.configImport.bind(this);
    this.peerGrpcUrlChange = this.peerGrpcUrlChange.bind(this);
    this.peerEventUrlChange = this.peerEventUrlChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);
    this.tlsPeerImport = this.tlsPeerImport.bind(this);
    this.tlsOrdererImport = this.tlsOrdererImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.mspidChange = this.mspidChange.bind(this);
    this.peerSSLTargetChange = this.peerSSLTargetChange.bind(this);
    this.ordererSSLTargetChange = this.ordererSSLTargetChange.bind(this);
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
        peerSSLTarget: this.state.peerSSLTarget,
        ordererSSLTarget: this.state.ordererSSLTarget,
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
    const certlabel = path.basename(selectedFile.path);
    this.setState({ certlabel });
  }

  tlsPeerImport() {
    const selectedFile = document.getElementById('tlsPeerFiles').files[0];// 获取读取的File对象
    this.setState({ tlsPeerPath: selectedFile.path });
    const tlsPeerLabel = path.basename(selectedFile.path);
    this.setState({ tlsPeerLabel });
  }

  tlsOrdererImport() {
    const selectedFile = document.getElementById('tlsOrdererFiles').files[0];// 获取读取的File对象
    this.setState({ tlsOrdererPath: selectedFile.path });
    const tlsOrdererLabel = path.basename(selectedFile.path);
    this.setState({ tlsOrdererLabel });
  }

  priImport() {
    const selectedFile = document.getElementById('priFiles').files[0];// 获取读取的File对象
    this.setState({ keyPath: selectedFile.path });
    const keylabel = path.basename(selectedFile.path);
    this.setState({ keylabel });
  }

  configImport() {
    const configFile = document.getElementById('configFiles').files[0];// 获取读取的File对象
    try {
      const config = yaml.safeLoad(fs.readFileSync(configFile.path));
      logger.info('Read configFile: ', config);
      const configDir = path.dirname(configFile.path);
      // TODO: Only support relative path so far. May support absolute path in future.
      this.setState({
        peerGrpcUrl: config.peerGrpcUrl,
        peerEventUrl: config.peerEventUrl,
        ordererUrl: config.ordererUrl,
        mspid: config.mspId,
        certPath: path.join(configDir, config.certificate),
        keyPath: path.join(configDir, config.privateKey),
        tlsPeerPath: config.peerTlsCaCert ? path.join(configDir, config.peerTlsCaCert) : '',
        tlsOrdererPath: config.ordererTlsCaCert ? path.join(configDir, config.ordererTlsCaCert) : '',
        peerSSLTarget: config.peerSslTarget,
        ordererSSLTarget: config.ordererSslTarget,
        certlabel: config.certificate ? path.basename(config.certificate) : config.certificate,
        keylabel: config.privateKey ? path.basename(config.privateKey) : config.privateKey,
        tlsPeerLabel: config.peerTlsCaCert ?
          path.basename(config.peerTlsCaCert) : config.peerTlsCaCert,
        tlsOrdererLabel: config.ordererTlsCaCert ?
          path.basename(config.ordererTlsCaCert) : config.ordererTlsCaCert,
      });
    } catch (e) {
      logger.error('Read desktop config file error: ', e.toString());
    }
  }

  ordererChange(event) {
    this.setState({ ordererUrl: event.target.value });
  }

  mspidChange(event) {
    this.setState({ mspid: event.target.value });
  }

  peerSSLTargetChange(event) {
    this.setState({ peerSSLTarget: event.target.value });
  }

  ordererSSLTargetChange(event) {
    this.setState({ ordererSSLTarget: event.target.value });
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
      width: '325px',
      height: 'auto',
      display: 'block',
      position: 'absolute',
      minHeight: '625px',
      backgroundImage: 'url(' + bcgd + ')',
    };
    const contentStyle = {
      padding: '30px 20px 30px 20px',
      backgroundColor: '#fff',
      width: '450px',
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
      padding: '10px 3px',
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
    const configStyle = {
      fontSize: '1.1em',
      border: '1px solid rgb(217, 217, 217)',
      borderRadius: '4px',
      display: 'block',
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
          <img src={bcgd} alt="background" />
        </div>

        <div style={contentStyle}>
          <Content>
            <div style={languageStyle}>
              <ButtonGroup>
                <Button style={buttonGroupStyle} onClick={this.changeLangtoEn}>En</Button>
                <Button style={buttonGroupStyle} onClick={this.changeLangtoCn}>中文</Button>
              </ButtonGroup>
            </div>
            <div style={LoginStyle}>
              <span style={fontStyle}>Fabric Desktop</span>
            </div>

            <div style={divStyle}>
              <input type="file" id="configFiles" name="configFiles" style={fileStyle} onChange={this.configImport} />
              <label htmlFor="configFiles" style={configStyle} >
                <Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />
                {this.state.Common.LOGIN_CONFIG}
              </label>
            </div>

            <div style={firstDivStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>Peer Grpc Url：</span>
              <Input type="text" style={InputStyle} value={this.state.peerGrpcUrl} onChange={this.peerGrpcUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>Peer Event Url：</span>
              <Input type="text" style={InputStyle} value={this.state.peerEventUrl} onChange={this.peerEventUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>Orderer Url:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererUrl} onChange={this.ordererChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>MSP ID:</span>
              <Input type="text" style={InputStyle} value={this.state.mspid} onChange={this.mspidChange} />
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>Certificate：</span>
              <input type="file" id="cerFiles" name="cerFiles" style={fileStyle}onChange={this.cerImport} />
              <label htmlFor="cerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.certlabel} </label>
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>Private Key：</span>
              <input type="file" id="priFiles" name="priFiles" style={fileStyle} onChange={this.priImport} />
              <label htmlFor="priFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.keylabel}</label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; Peer TLS CA Cert：</span>
              <input type="file" id="tlsPeerFiles" name="tlsPeerFiles" style={fileStyle} onChange={this.tlsPeerImport} />
              <label htmlFor="tlsPeerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsPeerLabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; Orderer TLS CA Cert：</span>
              <input type="file" id="tlsOrdererFiles" name="tlsOrdererFiles" style={fileStyle} onChange={this.tlsOrdererImport} />
              <label htmlFor="tlsOrdererFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsOrdererLabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; Peer SSL Target:</span>
              <Input type="text" style={InputStyle} value={this.state.peerSSLTarget} onChange={this.peerSSLTargetChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; Orderer SSL Target:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererSSLTarget} onChange={this.ordererSSLTargetChange} />
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
