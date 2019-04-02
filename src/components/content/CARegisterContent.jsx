// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// main feature: CA register and enroll
import React from 'react';
import { Button, Input } from 'antd';
import { getFabricClientSingleton } from '../../util/fabric';

const { TextArea } = Input;
const logger = require('electron-log');

/**
 * register参数：用户名、affiliation, role等等
 * enroll参数：用户名、密码
 */
export default class CARegisterContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),

      registerUserName: '',
      registerAffiliation: '',
      registerRole: '',
      registerOptional: '',
      registerResult: '',

      enrollUserName: '',
      enrollUserPassword: '',
      enrollOptional: '',
      enrollResult: '',
    };

    this.onChangeRegisterUserName = this.onChangeRegisterUserName.bind(this);
    this.onChangeRegisterAffiliation = this.onChangeRegisterAffiliation.bind(this);
    this.onChangeRegisterRole = this.onChangeRegisterRole.bind(this);
    this.onChangeRegisterOptional = this.onChangeRegisterOptional.bind(this);
    this.onChangeEnrollUserName = this.onChangeEnrollUserName.bind(this);
    this.onChangeEnrollUserPassword = this.onChangeEnrollUserPassword.bind(this);
    this.onChangeEnrollOptional = this.onChangeEnrollOptional.bind(this);

    this.handleRegister = this.handleRegister.bind(this);
    this.handleEnroll = this.handleEnroll.bind(this);
  }

  onChangeRegisterUserName(event) {
    this.setState({ registerUserName: event.target.value });
  }
  onChangeRegisterAffiliation(event) {
    this.setState({ registerAffiliation: event.target.value });
  }
  onChangeRegisterRole(event) {
    this.setState({ registerRole: event.target.value });
  }
  onChangeRegisterOptional(event) {
    this.setState({ registerOptional: event.target.value });
  }
  onChangeEnrollUserName(event) {
    this.setState({ enrollUserName: event.target.value });
  }
  onChangeEnrollUserPassword(event) {
    this.setState({ enrollUserPassword: event.target.value });
  }
  onChangeEnrollOptional(event) {
    this.setState({ enrollOptional: event.target.value });
  }

  handleRegister() {
    // FIXME: Object.assign is shallow copy. Be careful.
    const tmpReq = {
      enrollmentID: this.state.registerUserName,
      affiliation: this.state.registerAffiliation,
      role: this.state.role,
    };
    let req = tmpReq;
    if (this.state.registerOptional) {
      req = Object.assign({}, tmpReq, JSON.parse(this.state.registerOptional));
    }
    const self = this;
    logger.info('start to register user, RegisterRequest: ', req);
    getFabricClientSingleton()
      .then((client) => {
        logger.info('client: ', client.toString());
        return client.register(req);
      })
      .then((secret) => {
        // 输出密码，到页面上。
        self.setState({ registerResult: secret });
        logger.debug('register successfully, secret: ', secret);
      })
      .catch((err) => {
        self.setState({ registerResult: 'Register fails. Please check inputs/your CA identity are valid.' });
        logger.info('fail to register user, err: ', err);
        throw err;
      });
  }

  handleEnroll() {
    const tmpReq = {
      enrollmentID: this.state.enrollUserName,
      enrollmentSecret: this.state.enrollUserPassword,
    };
    let req = tmpReq;
    if (this.state.enrollOptional) {
      req = Object.assign({}, tmpReq, JSON.parse(this.state.enrollOptional));
    }
    const self = this;

    getFabricClientSingleton()
      .then((client) => {
        logger.debug('start to enroll, request: ', req);
        return client.enroll(req);
      })
      .then((enrollment) => {
        self.setState({ enrollResult: 'private key:\n' + enrollment.key.toBytes() + '\ncertificate:\n' + enrollment.certificate });
        logger.debug('enroll after registering successfully, enrollment: ', enrollment);
        // TODO: 输出enrollment中的证书、私钥到外部
      })
      .catch((err) => {
        self.setState({ enrollResult: 'Register fails. Please check inputs/your CA identity are valid.' });
        logger.debug(err);
      });
  }

  render() {
    const outerDivStyle = {
      padding: '10px 24px',
    };
    const spanStyle = {
      display: 'inline-block',
      width: '100px',
    };
    const configInputStyle = {
      marginLeft: '20px',
      width: '60%',
    };
    const optionalInputStyle = {
        marginLeft: '28px',
        width: '60%',
    };
    const DivStyle = {
      width: '560px',
      marginBottom: '10px',
    };
    const titleStyle = {
      fontSize: '130%',
      textAlign: 'center',
      marginBottom:'10px',
    };
    const ButtonStyle = {
      width: '15%',
      marginBottom: '10px',
    };
    const TipDivStyle = {
      display: 'inline-block',
      float: 'right',
      marginRight: '20px',
    };
    const asteriskStyle = {
      float: 'left',
      color: '#ff0000',
    };
    return (
      <div style={outerDivStyle}>

        <div style={titleStyle}>{this.state.Common.REGISTER}</div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.REGISTER_USERNAME}</span>
          <Input placeholder="User Name" style={configInputStyle} value={this.state.registerUserName} onChange={this.onChangeRegisterUserName} />
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.REGISTER_AFFILIATION}</span>
          <Input placeholder="eg. org1.department" style={configInputStyle} value={this.state.registerAffiliation} onChange={this.onChangeRegisterAffiliation} />
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.REGISTER_ROLE}</span>
          <Input placeholder="eg. client/peer/orderer/user/app" style={configInputStyle} value={this.state.registerRole} onChange={this.onChangeRegisterRole} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>{this.state.Common.REGISTER_OPTIONAL}</span>
          <Input placeholder="Optional json parameters" style={optionalInputStyle} value={this.state.registerOptional} onChange={this.onChangeRegisterOptional} />
        </div>
        <div style={DivStyle}>
          <Button style={ButtonStyle} type="primary" onClick={this.handleRegister}>{this.state.Common.REGISTER_CONFIRM}</Button>
          <TextArea
            placeholder="Register Result: Password"
            value={this.state.registerResult}
            autosize={{ minRows: 1, maxRows: 1 }}
            readOnly
          />
        </div>

        <div style={titleStyle}>{this.state.Common.ENROLL}</div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.ENROLL_USERNAME}</span>
          <Input placeholder="User Name" style={configInputStyle} value={this.state.enrollUserName} onChange={this.onChangeEnrollUserName} />
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.ENROLL_PASSWORD}</span>
          <Input placeholder="Password" style={configInputStyle} value={this.state.enrollUserPassword} onChange={this.onChangeEnrollUserPassword} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>{this.state.Common.ENROLL_OPTIONAL}</span>
          <Input placeholder="Optional json parameters" style={optionalInputStyle} value={this.state.enrollOptional} onChange={this.onChangeEnrollOptional} />
        </div>
        <div style={DivStyle}>
          <Button style={ButtonStyle} type="primary" onClick={this.handleEnroll}>{this.state.Common.ENROLL_CONFIRM}</Button>
          <TextArea
            placeholder="Enroll Result"
            value={this.state.enrollResult}
            autosize={{ minRows: 3, maxRows: 3 }}
            readOnly
          />
        </div>
      </div>

    );
  }
}
