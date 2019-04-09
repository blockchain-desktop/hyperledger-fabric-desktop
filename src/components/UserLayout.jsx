// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Icon, message, Form, Modal } from 'antd';
import { getFabricClientSingleton } from '../util/fabric';
import { getConfigDBSingleton } from '../util/createDB';

const FormItem = Form.Item;
const ButtonGroup = Button.Group;
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const logger = require('electron-log');

const db = getConfigDBSingleton();

const { Content } = Layout;

const bcgd = path.join(__dirname, '../../resources/styles/image/blc2.jpg');

const RegisterForm = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        Common: localStorage.getItem('language') === 'cn' ? require('../common/common_cn') : require('../common/common'),
      };
    }
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title={this.state.Common.USER_REGISTER}
          okText={this.state.Common.CREATE}
          cancelText={this.state.Common.CANCEL}
          onCancel={onCancel}
          onOk={onCreate}
          centered
          width="480px"
        >
          <Form layout="vertical">
            <FormItem label={this.state.Common.FABRIC_CA_SERVER}>
              {getFieldDecorator('server', {
                rules: [{ required: true }],
              })(
                <Input placeholder={this.state.Common.FABRIC_CA_SERVER} />,
              )}
            </FormItem>
            <FormItem label={this.state.Common.REGISTER_USER_NAME} >
              {getFieldDecorator('username', {
                rules: [{ required: true }],
              })(
                <Input placeholder={this.state.Common.REGISTER_USER_NAME} />,
              )}
            </FormItem>
            <FormItem label={this.state.Common.REGISTER_PASSWORD} >
              {getFieldDecorator('password', {
                rules: [{ required: true }],
              })(
                <Input placeholder={this.state.Common.REGISTER_PASSWORD} />,
              )}
            </FormItem>
            <FormItem label={this.state.Common.REGISTER_CERTIFICATE} >
              {getFieldDecorator('directory', {
                rules: [{ required: true }],
              })(
                <Input placeholder={this.state.Common.REGISTER_CERTIFICATE} />,
              )}
            </FormItem>
            {/* TODO: type='file'，直接选择文件 */}
            <FormItem label={this.state.Common.LOGIN_CA_SERVER_CA_CERT} >
              {getFieldDecorator('caTlsCertPath', {
                rules: [{}],
              })(
                <Input placeholder={this.state.Common.LOGIN_CA_SERVER_CA_CERT} />,
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  },
);

function _configImportPathHelper(filePath, parentPath) {
  return path.isAbsolute(filePath) ? filePath : path.join(parentPath, filePath);
}

export default class UserLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visibleRegisterForm: false,
      expand: false,
      peerGrpcUrl: 'grpcs://localhost:7051',
      peerEventUrl: 'grpcs://localhost:7053',
      ordererUrl: 'grpcs://localhost:7050',
      mspid: 'Org1MSP',
      certPath: '',
      keyPath: '',
      tlsPeerPath: '',
      tlsOrdererPath: '',
      tlsCAServerPath: '',
      peerSSLTarget: 'peer0.org1.example.com',
      ordererSSLTarget: 'orderer.example.com',
      certlabel: 'user certificate ',
      keylabel: 'user private key',
      tlsPeerLabel: 'peer tls ca cert',
      tlsOrdererLabel: 'orderer tls ca cert',
      tlsCAServerLabel: 'ca server tls ca cert',
      caServerUrl: 'http://localhost:7054', // TODO: 待实现
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
    this.tlsCAServerImport = this.tlsCAServerImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.mspidChange = this.mspidChange.bind(this);
    this.peerSSLTargetChange = this.peerSSLTargetChange.bind(this);
    this.ordererSSLTargetChange = this.ordererSSLTargetChange.bind(this);
    this.caServerUrlChange = this.caServerUrlChange.bind(this);
    this.changeLangtoEn = this.changeLangtoEn.bind(this);
    this.changeLangtoCn = this.changeLangtoCn.bind(this);
    this.toggle = this.toggle.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.showRegisterForm = this.showRegisterForm.bind(this);
  }

  onClick() {
    db.update({ id: 0 },
      { $set: { peerGrpcUrl: this.state.peerGrpcUrl,
        peerEventUrl: this.state.peerEventUrl,
        ordererUrl: this.state.ordererUrl,
        mspid: this.state.mspid,
        tlsPeerPath: this.state.tlsPeerPath,
        tlsOrdererPath: this.state.tlsOrdererPath,
        tlsCAServerPath: this.state.tlsCAServerPath,
        peerSSLTarget: this.state.peerSSLTarget,
        ordererSSLTarget: this.state.ordererSSLTarget,
        caServerUrl: this.state.caServerUrl,
        keyPath: this.state.keyPath,
        certPath: this.state.certPath,
        path: 'resources/key/users/' } },
      {},
      () => {
        getFabricClientSingleton().then(() => {
          db.update({ id: 0 },
            { $set: { isSign: 2 } },
            {}, () => {
            });
          this.props.onGetChildMessage(2);
        }, () => {
          message.error(this.state.Common.ERROR.certificateFailed);
        });
      });
  }

  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  registerUser() {
    logger.info('Register new user here!');
    this.showRegisterForm();
  }

  peerGrpcUrlChange(event) {
    this.setState({ peerGrpcUrl: event.target.value });
  }

  peerEventUrlChange(event) {
    this.setState({ peerEventUrl: event.target.value });
  }

  caServerUrlChange(event) {
    this.setState({ caServerUrl: event.target.value });
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

  tlsCAServerImport() {
    const selectedFile = document.getElementById('tlsCAServerFiles').files[0];// 获取读取的File对象
    this.setState({ tlsCAServerPath: selectedFile.path });
    const tlsCAServerLabel = path.basename(selectedFile.path);
    this.setState({ tlsCAServerLabel });
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
      this.setState({
        peerGrpcUrl: config.peerGrpcUrl,
        peerEventUrl: config.peerEventUrl,
        ordererUrl: config.ordererUrl,
        caServerUrl: config.caServerUrl,
        mspid: config.mspId,
        certPath: _configImportPathHelper(config.certificate, configDir),
        keyPath: _configImportPathHelper(config.privateKey, configDir),
        tlsPeerPath: config.peerTlsCaCert ? _configImportPathHelper(config.peerTlsCaCert, configDir) : '',
        tlsOrdererPath: config.ordererTlsCaCert ? _configImportPathHelper(config.ordererTlsCaCert, configDir) : '',
        tlsCAServerPath: config.caServerTlsCaCert ? _configImportPathHelper(config.caServerTlsCaCert, configDir) : '',
        peerSSLTarget: config.peerSslTarget,
        ordererSSLTarget: config.ordererSslTarget,
        certlabel: config.certificate ? path.basename(config.certificate) : config.certificate,
        keylabel: config.privateKey ? path.basename(config.privateKey) : config.privateKey,
        tlsPeerLabel: config.peerTlsCaCert ?
          path.basename(config.peerTlsCaCert) : config.peerTlsCaCert,
        tlsOrdererLabel: config.ordererTlsCaCert ?
          path.basename(config.ordererTlsCaCert) : config.ordererTlsCaCert,
        tlsCAServerLabel: config.caServerTlsCaCert ?
          path.basename(config.caServerTlsCaCert) : config.caServerTlsCaCert,
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
  saveFormRef(formRef) {
    this.formRef = formRef;
  }
  handleCancel() {
    this.setState({ visibleRegisterForm: false });
  }
  handleCreate() {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      logger.info('Received values of instanitateform: ', values.server);
      logger.debug('Enroll ca tls cert: ', values.caTlsCertPath);
      // FIXME: Enroll ca tls cert:  C:\fakepath\org1-ca-chain.pem

      // 调用接口这块有问题，需处理
      db.update({ id: 0 },
        { $set: {
          peerGrpcUrl: null,
          peerEventUrl: null,
          ordererUrl: null,
          caServerUrl: values.server,
          path: 'resources/key/users/',
          tlsCAServerPath: values.caTlsCertPath ? values.caTlsCertPath : '',
        } },
        {},
        () => {
          getFabricClientSingleton().then((fabricClient) => {
            const enrReq = {
              enrollmentID: values.username,
              enrollmentSecret: values.password,
            };
            return fabricClient.enroll(enrReq);
          }).then((enrollment) => {
            const certificate = values.directory + '/' + values.username + '.pem';
            const privatekey = values.directory + '/' + values.username + '.pri';
            logger.info('cert directory', certificate);
            logger.info('pri key directory', privatekey);
            fs.writeFileSync(certificate, enrollment.certificate, (errCert) => {
              if (errCert) {
                throw errCert;
              }
            });
            fs.writeFileSync(privatekey, enrollment.key.toBytes(), (errKey) => {
              if (errKey) {
                throw errKey;
              }
            });
          });
        });
      form.resetFields();
      this.setState({ visibleRegisterForm: false });
    });
  }
  showRegisterForm() {
    this.setState({ visibleRegisterForm: true });
  }
  render() {
    const LayoutStyle = {
      maxHeight: '680px',
      maxWidth: '800px',
    };
    const backgroundStyle = {
      width: '400px',
      height: 'auto',
      display: 'block',
      position: 'absolute',
      minHeight: '750px',
      backgroundImage: 'url(' + bcgd + ')',
    };
    const contentStyle = {
      padding: '10px 20px 10px 20px',
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
      width: '160px',
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
      width: '160px',
      display: 'block',
      float: 'right',
    };
    const firstDivStyle = {
      margin: '10px 8px 20px 8px',
    };
    const divStyle = {
      margin: '15px 6px',
    };
    const lastDivStyle = {
      margin: '16px 6px',
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

            <div style={firstDivStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>{this.state.Common.LOGIN_CERTIFICATE}:</span>
              <input type="file" id="cerFiles" name="cerFiles" style={fileStyle}onChange={this.cerImport} />
              <label htmlFor="cerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.certlabel} </label>
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>{this.state.Common.LOGIN_PRIVATE_KEY}:</span>
              <input type="file" id="priFiles" name="priFiles" style={fileStyle} onChange={this.priImport} />
              <label htmlFor="priFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.keylabel}</label>
            </div>
            <div style={divStyle}>
              <span style={asteriskStyle}>*&nbsp;</span>
              <span style={spanStyle}>{this.state.Common.LOGIN_MSP_ID}:</span>
              <Input type="text" style={InputStyle} value={this.state.mspid} onChange={this.mspidChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_PEER_GRPC_URL}:</span>
              <Input type="text" style={InputStyle} value={this.state.peerGrpcUrl} onChange={this.peerGrpcUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_PEER_EVENT_URL}:</span>
              <Input type="text" style={InputStyle} value={this.state.peerEventUrl} onChange={this.peerEventUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_ORDERER_URL}:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererUrl} onChange={this.ordererChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_CA_SERVER_URL}:</span>
              <Input type="text" style={InputStyle} value={this.state.caServerUrl} onChange={this.caServerUrlChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_PEER_TLS_CA_CERT}:</span>
              <input type="file" id="tlsPeerFiles" name="tlsPeerFiles" style={fileStyle} onChange={this.tlsPeerImport} />
              <label htmlFor="tlsPeerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsPeerLabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_ORDERER_TLS_CA_CERT}:</span>
              <input type="file" id="tlsOrdererFiles" name="tlsOrdererFiles" style={fileStyle} onChange={this.tlsOrdererImport} />
              <label htmlFor="tlsOrdererFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsOrdererLabel} </label>
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_PEER_SSL_TARGET}:</span>
              <Input type="text" style={InputStyle} value={this.state.peerSSLTarget} onChange={this.peerSSLTargetChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_ORDERER_SSL_TARGET}:</span>
              <Input type="text" style={InputStyle} value={this.state.ordererSSLTarget} onChange={this.ordererSSLTargetChange} />
            </div>
            <div style={divStyle}>
              <span style={spanStyle}>&nbsp; {this.state.Common.LOGIN_CA_SERVER_CA_CERT}:</span>
              <input type="file" id="tlsCAServerFiles" name="tlsCAServerFiles" style={fileStyle} onChange={this.tlsCAServerImport} />
              <label htmlFor="tlsCAServerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsCAServerLabel} </label>
            </div>
            <div style={{ margin: '10px 6px', display: this.state.expand ? 'block' : 'none' }}>
              <input type="file" id="configFiles" name="configFiles" style={fileStyle} onChange={this.configImport} />
              <label htmlFor="configFiles" style={configStyle} >
                <Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />
                {this.state.Common.LOGIN_CONFIG}
              </label>
            </div>
            <a style={{ marginLeft: '10px', marginRight: '200px', fontSize: 12 }} onClick={this.toggle}>
                Collapse <Icon type={this.state.expand ? 'up' : 'down'} />
            </a>
            <a style={{ fontSize: 12 }} onClick={this.registerUser}>
                Enroll <Icon type="user" />
            </a>
            <div style={lastDivStyle}>
              <Button type="primary" style={buttonStyle} onClick={this.onClick}>{this.state.Common.LOGIN}</Button>
            </div>
          </Content>
          <RegisterForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visibleRegisterForm}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
        </div>
      </Layout>

    );
  }
}
