// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

/* eslint-disable react/no-string-refs,react/no-find-dom-node */
import React from 'react';
import ReactDOM from 'react-dom';
import { Button, message, Input, Icon, Tooltip } from 'antd';
import getFabricClientSingleton from '../../util/fabric';
import { copyDir, copyFile, deleteDir } from '../../util/tools';

const path = require('path');
// const fs = require('fs');
const logger = require('electron-log');

export default class ChannelManangeContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),
      channel: '',
      channelValue: '',
      channelName: '',
      channelNameValue: '',
      certLabel: '',
      yamlLabel: '',
      configProfile: 'TwoOrgsChannel',
      sslTarget: 'orderer.example.com',
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onChangeAddChannel = this.onChangeAddChannel.bind(this);
    this.onChangeConfigProfile = this.onChangeConfigProfile.bind(this);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleAddToChannelSuccess = this.handleAddToChannelSuccess.bind(this);
    this.handleAddtoChannelFailed = this.handleAddtoChannelFailed.bind(this);
    this.handleAddToChannel = this.handleAddToChannel.bind(this);
    this.handleCreateChannel = this.handleCreateChannel.bind(this);
    this.handleCreateChannelSuccess = this.handleCreateChannelSuccess.bind(this);
    this.handleCreateChannelFailed = this.handleCreateChannelFailed.bind(this);
    this.handleCreateChannelCallback = this.handleCreateChannelCallback.bind(this);
    this.handleAddToChannelCallback = this.handleAddToChannelCallback.bind(this);
    this.sslTargetChange = this.sslTargetChange.bind(this);
    this.orgCertDirImport = this.orgCertDirImport.bind(this);
    this.yamlFileImport = this.yamlFileImport.bind(this);
  }

  componentDidMount() {
    const input = ReactDOM.findDOMNode(this.refs.certDirSupport);
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.setAttribute('multiple', '');
  }
  onChangeChannel(event) {
    this.setState({ channelName: event.target.value });
    this.setState({ channelNameValue: event.target.value });
  }
  onChangeAddChannel(event) {
    this.setState({ channel: event.target.value });
    this.setState({ channelValue: event.target.value });
  }
  onChangeConfigProfile(event) {
    this.setState({ configProfile: event.target.value });
  }

  handleChannelChange(value) {
    logger.info('channel choosed: ' + value);
    this.setState({ channel: value });
  }

  handleAddToChannelSuccess() {
    message.success(this.state.Common.INFO.addChannelSuccess);
  }

  handleAddtoChannelFailed() {
    message.error(this.state.Common.ERROR.addChannelFailed);
  }
  handleCreateChannelSuccess() {
    message.success(this.state.Common.INFO.createChanelSuccess);
  }
  handleCreateChannelFailed() {
    message.error(this.state.Common.ERROR.createChanelFailed);
  }

  sslTargetChange(event) {
    this.setState({ sslTarget: event.target.value });
  }

  handleAddToChannel() {
    getFabricClientSingleton().then((fabricClient) => {
      fabricClient.joinChannel(this.state.channel, this.state.sslTarget)
        .then(this.handleAddToChannelCallback, this.handleAddToChannelCallback);
    });
  }

  handleAddToChannelCallback(result) {
    // 如果加入通道失败
    if (result.indexOf('fail') > -1) {
      this.handleAddtoChannelFailed();
    } else {
      // 如果加入通道成功
      this.handleAddToChannelSuccess();
    }
    this.setState({ channelValue: '' });
  }

  handleCreateChannel() {
    logger.info('the to-create channel name: ' + this.state.channelName);
    getFabricClientSingleton().then((fabricClient) => {
      fabricClient.createChannel(this.state.channelName,
        this.state.configProfile, this.state.sslTarget)
        .then(this.handleCreateChannelCallback, this.handleCreateChannelCallback);
    });
  }

  handleCreateChannelCallback(result) {
    // 如果创建通道失败
    if (result.indexOf('fail') > -1) {
      this.handleCreateChannelFailed();
    } else {
      // 创建通道成功
      this.handleCreateChannelSuccess();
      // 持久化
    }
    this.setState({ channelNameValue: '' });
  }

  orgCertDirImport() {
    const selectedFile = document.getElementById('cerFiles').files[0];// 获取读取的File对象
    if (selectedFile) {
      const certLabel = path.basename(selectedFile.path);
      this.setState({ certLabel });
      const txPath = path.join(__dirname, '../../../resources/key/tx/' + certLabel);
      deleteDir(txPath);
      copyDir(selectedFile.path, txPath);
    }
  }

  yamlFileImport() {
    const selectedFile = document.getElementById('yamlFile').files[0];// 获取读取的File对象
    this.setState({ yamlFile: selectedFile.path });
    const yamlLabel = path.basename(selectedFile.path);
    this.setState({ yamlLabel });
    const txPath = path.join(__dirname, '../../../resources/key/tx/configtx.yaml');
    copyFile(selectedFile.path, txPath);
  }

  render() {
    const outerDivStyle = {
      padding: '24px',
    };
    const spanStyle = {
      marginRight: '10px',
      display: 'inline-block',
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
      marginLeft: '164px',
      marginTop: '-25px',
    };
    const sslInputStyle = {
      marginLeft: '32px',
      width: '60%',
    };
    const configInputStyle = {
      marginLeft: '56px',
      width: '60%',
    };
    const CreateInputStyle = {
      marginLeft: '90px',
      width: '40%',
    };
    const AddInputStyle = {
      marginLeft: '70px',
      width: '40%',
    };
    const DivStyle = {
      width: '80%',
      marginBottom: '30px',
    };
    const ButtonStyle = {
      marginLeft: '10px',
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
        <div style={TipDivStyle}>
          <Tooltip placement="topLeft" title={this.state.Common.TIP.creatChannel} style={{ width: '16px' }}>
            <Icon type="question-circle" style={{ fontSize: '16px', color: '#0083FA' }} />
          </Tooltip>
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={SpanStyle}>{this.state.Common.CPNFIG_YAML} : </span>
          <input type="file" id="yamlFile" name="yamlFile" style={fileStyle} onChange={this.yamlFileImport} />
          <label htmlFor="yamlFile" style={labelStyle} ><Icon type="copy" theme="outlined" style={{ color: '#0083FA', paddingLeft: '7px', paddingRight: '7px' }} />{this.state.yamlLabel} </label>
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={SpanStyle}>{this.state.Common.MSP_FOLDER} : </span>
          <input type="file" id="cerFiles" name="cerFiles" style={fileStyle} onChange={this.orgCertDirImport} ref="certDirSupport" />
          <label htmlFor="cerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', paddingLeft: '7px', paddingRight: '7px' }} />{this.state.certLabel} </label>
        </div>
        <div style={DivStyle}>
          <span style={asteriskStyle}>*</span>
          <span style={spanStyle}>{this.state.Common.CONFIG_NAME} : </span>
          <Input placeholder="channel config profile" style={configInputStyle} value={this.state.configProfile} onChange={this.onChangeConfigProfile} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>orderer ssl target:</span>
          <Input type="text" style={sslInputStyle} value={this.state.sslTarget} onChange={this.sslTargetChange} />
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>{this.state.Common.CREATECHANNEl} : </span>
          <Input placeholder="channel name" style={CreateInputStyle} value={this.state.channelNameValue} onChange={this.onChangeChannel} />
          <Button style={ButtonStyle} type="primary" onClick={this.handleCreateChannel}>{this.state.Common.SUBMITCHANNEl}</Button>
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>{this.state.Common.ADDCHANNEL} :</span>
          <Input placeholder="channel name" style={AddInputStyle} value={this.state.channelValue} onChange={this.onChangeAddChannel} />
          <Button style={ButtonStyle} type="primary" onClick={this.handleAddToChannel}>{this.state.Common.SUBMIT}</Button>
        </div>

      </div>
    );
  }
}
/*
*  1.显示通道，包含通道成员等信息(可简化，目前暂未在SDK找到查找通道成员的方法)
*  2.创建通道，用户可以通过客户端来制定哪些组织可加入通道， 即可通过客户端生成用户自定义的yaml文件
*            (1)前端，用户添加组织，包括组织名称，MSPID， MSPDir，AnchorPeers，MSPDir即msp证书的目录
*           （2）后台，通过用户所输入的，生成yaml文件，并配置好证书，后面创建通道跟现有操作保持一致
*  3.更新通道，用户可以通过更新通道来新增成员，该成员在创建通道时未定义在yaml文件内
*
* */
