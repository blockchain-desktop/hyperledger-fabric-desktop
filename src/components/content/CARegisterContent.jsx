// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// main feature: CA register and enroll
import React from 'react';
import { Button, Input } from 'antd';
import { getFabricClientSingleton } from '../../util/fabric';

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

      enrollUserName: '',
      enrollUserPassword: '',
      enrollOptional: '',
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

    logger.info('start to register user, RegisterRequest: ', req);
    getFabricClientSingleton()
      .then((client) => {
        logger.info('client: ', client.toString());
        return client.register(req);
      })
      .then((enrollment) => {
        // TODO: 输出密码，到页面上。
        logger.info('register successfully, enrollment: ', enrollment);
      })
      .catch((err) => {
        logger.info('fail to register user, err: ', err);
        throw err;
      });
  }

  handleEnroll() {

  }

  render() {
    const outerDivStyle = {
      padding: '24px',
    };
    const spanStyle = {
      marginRight: '10px',
      display: 'inline-block',
      width: '100px',
    };
    const SpanStyle = {
      marginTop: '30px',
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
      width: '60%',
      height: '32px',
      verticalAlign: 'middle',
      textAlign: 'center',
      lineHeight: '30px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      marginLeft: '146px',
      marginTop: '-25px',
    };
    const configInputStyle = {
      marginLeft: '30px',
      width: '60%',
    };
    const CreateInputStyle = {
      marginLeft: '36px',
      width: '40%',
    };
    const AddInputStyle = {
      marginLeft: '36px',
      width: '40%',
    };
    const DivStyle = {
      width: '560px',
      marginBottom: '30px',
    };
    const ButtonStyle = {
      marginLeft: '20px',
      width: '15%',
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

        <div>注册</div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.REGISTER_USERNAME}</span>
          <Input placeholder="User Name" style={configInputStyle} value={this.state.registerUserName} onChange={this.onChangeRegisterUserName} />
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>组织归属</span>
          <Input placeholder="eg. org1.department" style={configInputStyle} value={this.state.registerAffiliation} onChange={this.onChangeRegisterAffiliation} />
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>角色类型</span>
          <Input placeholder="client/peer/orderer/user/app" style={configInputStyle} value={this.state.registerRole} onChange={this.onChangeRegisterRole} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>其他属性</span>
          <Input placeholder="Optional" style={configInputStyle} value={this.state.registerOptional} onChange={this.onChangeRegisterOptional} />
        </div>
        <div style={DivStyle}>
          <Button style={ButtonStyle} type="primary" onClick={this.handleRegister}>注册</Button>
        </div>

        <div >证书私钥领取</div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>用户名</span>
          <Input placeholder="User Name" style={configInputStyle} value={this.state.enrollUserName} onChange={this.onChangeEnrollUserName} />
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>密码</span>
          <Input placeholder="Password" style={configInputStyle} value={this.state.enrollUserPassword} onChange={this.onChangeEnrollUserPassword} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>其他属性</span>
          <Input placeholder="Optional" style={configInputStyle} value={this.state.enrollOptional} onChange={this.onChangeEnrollOptional} />
        </div>
        <div style={DivStyle}>
          <Button style={ButtonStyle} type="primary" onClick={this.handleEnroll}>领取</Button>
        </div>
      </div>

    );
  }
}
