// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Input, Select, Radio, message, Modal, Icon, Tag, Tooltip } from 'antd';
import getFabricClientSingleton from '../../util/fabric';

const logger = require('electron-log');
const path = require('path');

const { TextArea } = Input;
const { Option } = Select;


export default class ChaincodeInvokeContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),
      result: '',
      value: '',
      channel: '',
      contract: '',
      fcn: '',
      args: '',
      type: 'query',
      channelList: [],
      contractList: {},
      peerModal: false,
      tlsPeerLabel: ' choose a tls peer key',
      tlsPeerPath: '',
      peerGrpcUrl: 'grpcs://139.198.122.54:9051',
      peerCount: 1,
      peerGrpUrlList: [],
      tlsPeerPathList: [],
      sslTargetList: [],
      tags: [],
      sslTarget: 'peer0.org2.example.com',
      disabled: true,
    };

    this.onClick = this.onClick.bind(this);
    this.contractChange = this.contractChange.bind(this);
    this.fcnChange = this.fcnChange.bind(this);
    this.argsChange = this.argsChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.channelChange = this.channelChange.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.peerModalHandleOk = this.peerModalHandleOk.bind(this);
    this.peerModalHandleCancel = this.peerModalHandleCancel.bind(this);
    this.tlsPeerImport = this.tlsPeerImport.bind(this);
    this.peerGrpcUrlChange = this.peerGrpcUrlChange.bind(this);
    this.sslTargetChange = this.sslTargetChange.bind(this);
    this.showPeerModal = this.showPeerModal.bind(this);
    this.handleClose = this.handleClose.bind(this);

    let fc;
    getFabricClientSingleton()
      .then((fabricClient) => {
        fc = fabricClient;
        return fc.queryChannels();
      })
      .then((channelName) => {
        const promises = [];
        const channelList = [];
        for (let i = 0; i < channelName.length; i++) {
          if (i === 0) {
            this.setState({
              channel: channelName[i].channel_id,
            });
          }
          channelList[i] = channelName[i].channel_id;
          const promise = new Promise((resolve) => {
            logger.info('asdf');
            return fc.queryInstantiatedChaincodes(channelList[i])
              .then((contract) => {
                const tempContractList = [];
                for (let j = 0; j < contract.length; j++) {
                  tempContractList[j] = contract[j].name;
                }
                const output = {
                  key: i,
                  value: tempContractList,
                };
                resolve(output);
              });
          });
          promises.push(promise);
        }
        this.setState({ channelList });
        return Promise.all(promises);
      }).then((result) => {
        const contractList = {};
        for (let i = 0; i < result.length; i++) {
          contractList[this.state.channelList[result[i].key]] = result[i].value;
        }
        this.setState({
          contractList,
          contract: contractList[this.state.channelList[0]] ? contractList[this.state.channelList[0]][0] : '',
        });
      });
  }

  // componentDidMount() {
  //   this.state.timer = setInterval(() => {
  //     logger.info('this is a timer');
  //   }, 60000);
  // }
  //
  // componentWillUnmount() {
  //   if (this.state.timer != null) {
  //     clearInterval(this.state.timer);
  //     db.remove({}, { multi: true }, (err) => {
  //       if (err) {
  //         logger.info(err);
  //       }
  //     });
  //     const tempData = {
  //       channel: this.state.channel,
  //       contract: this.state.contract,
  //       fcn: this.state.fcn,
  //     };
  //     db.insert(tempData, (error) => {
  //       if (error) {
  //         logger.info('The operation of insert into database failed');
  //       }
  //     });
  //   }
  // }

  onClick() {
    logger.info('peerUrl', this.state.peerGrpUrlList);
    logger.info('tlsPeerPath', this.state.tlsPeerPathList);
    this.setState({ result: '' });

    getFabricClientSingleton().then((fabricClient) => {
      if (this.state.type === 'query') {
        fabricClient.queryCc(this.state.contract,
          this.state.fcn,
          this.state.args,
          this.state.channel)
          .then(this.onClickCallback, this.errorHandler);
      } else if (this.state.type === 'invoke') {
        fabricClient.invokeCc(this.state.contract,
          this.state.fcn,
          this.state.args,
          this.state.channel,
          this.state.peerGrpUrlList,
          this.state.tlsPeerPathList,
          this.state.sslTargetList)
          .then(this.onClickCallback, this.errorHandler);
      } else {
        logger.error('Chaincode calling type is invalid.');
      }
    });
  }

  onClickCallback(result) {
    this.setState({ result });
  }

  peerModalHandleOk() {
    const peerGrpUrlList = this.state.peerGrpUrlList.concat(this.state.peerGrpcUrl);
    const tlsPeerPathList = this.state.tlsPeerPathList.concat(this.state.tlsPeerPath);
    const tags = this.state.tags.concat(this.state.sslTarget.length > 10 ?
      this.state.sslTarget.substring(0, 10) : this.state.sslTarget);
    const sslTargetList = this.state.sslTargetList.concat(this.state.sslTarget);
    this.setState({
      peerModal: false,
      peerGrpUrlList,
      tlsPeerPathList,
      tags,
      sslTargetList,
    });
  }

  peerModalHandleCancel() {
    this.setState({
      peerModal: false,
    });
  }

  errorHandler() {
    message.error(this.state.Common.ERROR.queryFailed);
  }
  // getConfig() {
  //   db.find({}, (err, data) => {
  //     if (data.length !== 0) {
  //       this.setState({
  //         channel: data[0].channel,
  //         contract: data[0].contract,
  //         fcn: data[0].fcn,
  //       });
  //     }
  //   });
  // }

  contractChange(value) {
    this.setState({ contract: value });
  }

  fcnChange(event) {
    this.setState({ fcn: event.target.value });
  }

  argsChange(value) {
    if (value != null) { this.setState({ args: value }); }
  }

  typeChange(event) {
    this.setState({ type: event.target.value });
    if (event.target.value === 'invoke') {
      this.setState({ disabled: false });
    } else {
      this.setState({ disabled: true });
    }
    // console.log('event.target.value: ');
    // console.log(event.target.value);
  }

  channelChange(value) {
    this.setState({ channel: value, contract: this.state.contractList[value] ? this.state.contractList[value][0] : '' });
  }

  tlsPeerImport() {
    const selectedFile = document.getElementById('tlsPeerFiles').files[0];// 获取读取的File对象
    this.setState({ tlsPeerPath: selectedFile.path });
    this.setState({ yamlFile: selectedFile.path });
    const tlsPeerLabel = path.basename(selectedFile.path);
    this.setState({ tlsPeerLabel });
  }

  peerGrpcUrlChange(event) {
    this.setState({ peerGrpcUrl: event.target.value });
  }

  sslTargetChange(event) {
    this.setState({ sslTarget: event.target.value });
  }

  showPeerModal() {
    this.setState({
      peerModal: true,
    });
  }

  handleClose(removedTag) {
    const tempTags = this.state.tags;
    let index = 0;
    for (let i = 0; i < tempTags.length; i++) {
      if ((tempTags[i].length > 10 ? tempTags[i].substring(0, 10) : tempTags[i]) === removedTag) {
        index = i;
        break;
      }
    }
    const peerGrpUrlList = this.state.peerGrpUrlList
      .filter(tag => tag !== this.state.peerGrpUrlList[index]);
    const tags = this.state.tags
      .filter(tag => tag !== this.state.tags[index]);
    const tlsPeerPathList = this.state.tlsPeerPathList
      .filter(tag => tag !== this.state.tlsPeerPathList[index]);
    const sslTargetList = this.state.sslTargetList
      .filter(tag => tag !== this.state.sslTargetList[index]);
    this.setState({
      tags,
      peerGrpUrlList,
      tlsPeerPathList,
      sslTargetList,
    });
  }

  render() {
    const outerDivStyle = {
      padding: '0 15px',
      height: '100%',
    };
    const divStyle = {
      margin: '24px 0',
    };
    const inputDivStyle = {
      float: 'right',
      width: '65%',
      marginRight: '22%',
    };
    const inputStyle = {
      width: '100%',
    };
    const buttonStyle = {
      width: '100%',
    };
    const addButtonStyle = {
      width: '40%',
    };
    const spanStyle = {
      display: 'inlineBlock',
      fontSize: '1.2em',
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
    const firstDivStyle = {
      width: '65%',
      margin: '10px 8px 20px 8px',
      float: 'center',
    };
    const asteriskStyle = {
      float: 'left',
      color: '#ff0000',
    };
    const InputStyle = {
      width: '200px',
      display: 'block',
      float: 'right',
    };
    const modalDivStyle = {
      width: '65%',
      margin: '20px 8px',
      float: 'center',
    };

    const { tags } = this.state;

    return (
      <div style={outerDivStyle}>

        <div style={divStyle}>
          {this.state.Common.CHANNEL_NAME}
          <div style={inputDivStyle}>
            <Select
              style={inputStyle}
              value={this.state.channel}
              onChange={this.channelChange}
            >
              {this.state.channelList.map(channel => <Option key={channel}>{channel}</Option>)}
            </Select>
          </div>
        </div>

        <div style={divStyle}>
          {this.state.Common.CONTRACT_NAME}
          <div style={inputDivStyle}>
            <Select
              style={inputStyle}
              value={this.state.contract}
              onChange={this.contractChange}
            >
              {this.state.contractList[this.state.channel] ?
                this.state.contractList[this.state.channel]
                  .map(city => <Option key={city}>{city}</Option>) : null}
            </Select>
          </div>
        </div>

        <div style={divStyle}>
          {this.state.Common.FUNCTION_NAME}
          <div style={inputDivStyle}>
            <Input type="text" value={this.state.fcn} placeholder="function name" style={inputStyle} onChange={this.fcnChange} />
          </div>
        </div>

        <div style={divStyle}>
          <span>{this.state.Common.PARAMETER}</span>
          <div style={inputDivStyle}>
            <Select mode="tags" style={inputStyle} placeholder="parameter" onChange={this.argsChange}>
              <Option value="null">null</Option>
            </Select>
          </div>
        </div>

        <div style={divStyle}>
          {this.state.Common.METHOD}
          <div style={inputDivStyle}>
            <Radio.Group value={this.state.type} buttonStyle="solid" onChange={this.typeChange}>
              <Radio.Button value="query">query</Radio.Button>
              <Radio.Button value="invoke">invoke</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        <div style={divStyle}>
          {this.state.Common.PEER}
          <div style={inputDivStyle}>
            <Button type="primary" ghost style={addButtonStyle} onClick={this.showPeerModal} disabled={this.state.disabled}>
              <Icon type="plus" />
              {this.state.Common.ADD_PEERS}
            </Button>
            &emsp;
            {tags.map((tag) => {
              const isLongTag = tag.length > 20;
              const tagElem = (
                <Tag key={tag} closable afterClose={() => this.handleClose(tag)}>
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </Tag>
              );
              return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
            })}
          </div>
        </div>

        <div style={divStyle}>
          <TextArea
            placeholder="result"
            value={this.state.result}
            autosize={{ minRows: 6, maxRows: 6 }}
            readOnly
          />
        </div>

        <div style={divStyle}>
          <Button type="primary" style={buttonStyle} onClick={this.onClick}>{this.state.Common.SEND}</Button>
        </div>

        <Modal
          title={this.state.Common.ADD_PEERS}
          visible={this.state.peerModal}
          onOk={this.peerModalHandleOk}
          onCancel={this.peerModalHandleCancel}
          width="560px"
          centered
        >
          <div style={firstDivStyle}>
            <span style={asteriskStyle}>*&nbsp;</span>
            <span style={spanStyle}>ssl target：</span>
            <Input type="text" style={InputStyle} value={this.state.sslTarget} onChange={this.sslTargetChange} />
          </div>
          <div style={firstDivStyle}>
            <span style={asteriskStyle}>*&nbsp;</span>
            <span style={spanStyle}> peer grpc url：</span>
            <Input type="text" style={InputStyle} value={this.state.peerGrpcUrl} onChange={this.peerGrpcUrlChange} />
          </div>
          <div style={modalDivStyle}>
            <span style={asteriskStyle}>*&nbsp;</span>
            <span style={spanStyle}>tls peer key：</span>
            <input type="file" id="tlsPeerFiles" name="tlsPeerFiles" style={fileStyle} onChange={this.tlsPeerImport} />
            <label htmlFor="tlsPeerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', padding: '0 7px 0 0' }} />&thinsp;{this.state.tlsPeerLabel} </label>
          </div>
        </Modal>
      </div>
    );
  }
}
