// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// main feature: CA register and enroll
import React from 'react';
import { Button, Input } from 'antd';
import { getFabricClientSingleton } from '../../util/fabric';

const { TextArea } = Input;
const logger = require('electron-log');

export default class CAUpdateContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),

      reenrollOptional: '',
      reenrollResult: '',

      revokeUserName: '',
      revokeOptional: '',
      revokeResult: '',
    };

    this.onChangeReenrollOptional = this.onChangeReenrollOptional.bind(this);
    this.onChangeRevokeUserName = this.onChangeRevokeUserName.bind(this);
    this.onChangeRevokeOptional = this.onChangeRevokeOptional.bind(this);
    this.handleReenroll = this.handleReenroll.bind(this);
    this.handleRevoke = this.handleRevoke.bind(this);
  }

  onChangeReenrollOptional(event) {
    this.setState({ reenrollOptional: event.target.value });
  }
  onChangeRevokeUserName(event) {
    this.setState({ revokeUserName: event.target.value });
  }
  onChangeRevokeOptional(event) {
    this.setState({ revokeOptional: event.target.value });
  }

  handleReenroll() {
    let req = null;
    if (this.state.enrollOptional) {
      req = JSON.parse(this.state.enrollOptional);
    }
    const self = this;

    getFabricClientSingleton()
      .then((client) => {
        logger.debug('start to reenroll, request: ', req);
        return client.reenroll(req);
      })
      .then((enrollment) => {
        self.setState({ reenrollResult: 'private key:\n' + enrollment.key.toBytes() + '\ncertificate:\n' + enrollment.certificate });
        logger.debug('reenroll successfully, enrollment: ', enrollment);
        // TODO: 输出enrollment中的证书、私钥到外部
      })
      .catch((err) => {
        self.setState({ reenrollResult: 'Reenrollment fails. Please check inputs/your CA identity are valid.' });
        logger.debug(err);
      });
  }

  handleRevoke() {
    const tmpReq = {
      enrollmentID: this.state.revokeUserName,
    };
    let req = tmpReq;
    if (this.state.revokeOptional) {
      req = Object.assign({}, tmpReq, JSON.parse(this.state.revokeOptional));
    }

    const self = this;

    getFabricClientSingleton()
      .then((client) => {
        logger.debug('start to revoke, request: ', req);
        return client.revoke(req);
      })
      .then((result) => {
        logger.debug('revoke successfully, result: ', result);
        self.setState({ revokeResult: result.toString() });
      })
      .catch((err) => {
        self.setState({ revokeResult: 'Revocation fails.' });
        logger.debug(err);
      });
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

        <div>{this.state.Common.REENROLL}</div>
        <div style={DivStyle}>
          <span style={spanStyle}>{this.state.Common.REENROLL_OPTIONAL}</span>
          <Input placeholder="Optional json parameters" style={configInputStyle} value={this.state.reenrollOptional} onChange={this.onChangeReenrollOptional} />
        </div>
        <div style={DivStyle}>
          <Button style={ButtonStyle} type="primary" onClick={this.handleReenroll}>{this.state.Common.REENROLL_CONFIRM}</Button>
          <TextArea
            placeholder="Reenroll Result"
            value={this.state.reenrollResult}
            autosize={{ minRows: 4, maxRows: 4 }}
            readOnly
          />
        </div>

        <div >{this.state.Common.REVOKE}</div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.REVOKE_USERNAME}</span>
          <Input placeholder="User ID" style={configInputStyle} value={this.state.revokeUserName} onChange={this.onChangeRevokeUserName} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>{this.state.Common.REVOKE_OPTIONAL}</span>
          <Input placeholder="Optional json parameters" style={configInputStyle} value={this.state.revokeOptional} onChange={this.onChangeRevokeOptional} />
        </div>
        <div style={DivStyle}>
          <Button style={ButtonStyle} type="primary" onClick={this.handleRevoke}>{this.state.Common.REVOKE_CONFIRM}</Button>
          <TextArea
            placeholder="Revoke Result"
            value={this.state.revokeResult}
            autosize={{ minRows: 2, maxRows: 2 }}
            readOnly
          />
        </div>

        {/*TODO: 实现generateCRL */}
      </div>

    );
  }
}
