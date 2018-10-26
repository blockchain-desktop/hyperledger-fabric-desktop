// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Input, Select, Radio } from 'antd';
import getFabricClientSingleton from '../../util/fabric';

const logger = require('electron-log');

const { TextArea } = Input;
const { Option } = Select;

export default class ChaincodeInvokeContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: '',
      value: '',
      channel: '',
      chaincodeId: '',
      fcn: '',
      args: '',
      type: 'query',
    };

    this.onClick = this.onClick.bind(this);
    this.chaincodeIdChange = this.chaincodeIdChange.bind(this);
    this.fcnChange = this.fcnChange.bind(this);
    this.argsChange = this.argsChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.channelChange = this.channelChange.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);
  }

  onClick() {
    this.setState({ result: '' });

    const fc = getFabricClientSingleton();
    if (this.state.type === 'query') {
      fc.queryCc(this.onClickCallback,
        this.state.chaincodeId,
        this.state.fcn,
        this.state.args,
        this.state.channel);
    } else if (this.state.type === 'invoke') {
      fc.invokeCc(this.onClickCallback,
        this.state.chaincodeId,
        this.state.fcn,
        this.state.args,
        this.state.channel);
    } else {
      logger.error('Chaincode calling type is invalid.');
    }
  }

  onClickCallback(result) {
    this.setState({ result });
  }

  chaincodeIdChange(event) {
    this.setState({ chaincodeId: event.target.value });
  }

  fcnChange(event) {
    this.setState({ fcn: event.target.value });
  }

  argsChange(value) {
    if (value != null) { this.setState({ args: value }); }
  }

  typeChange(event) {
    this.setState({ type: event.target.value });
  }

  channelChange(event) {
    this.setState({ channel: event.target.value });
  }

  render() {
    const outerDivStyle = {
      minHeight: '900px',
      padding: '0 15px',
    };
    const divStyle = {
      margin: '24px 0',
    };
    const inputStyle = {
      width: '70%',
    };
    const buttonStyle = {
      width: '100%',
    };
    return (
      <div style={outerDivStyle}>

        <div style={divStyle}>
          通道名称：
          <Input type="text" value={this.state.channel} placeholder="mychannel" style={inputStyle} onChange={this.channelChange} />
        </div>

        <div style={divStyle}>
          智能合约：
          <Input type="text" value={this.state.chaincodeId} placeholder="fabcar" style={inputStyle} onChange={this.chaincodeIdChange} />
        </div>

        <div style={divStyle}>
          函数名称：
          <Input type="text" value={this.state.fcn} placeholder="queryAllCars" style={inputStyle} onChange={this.fcnChange} />
        </div>

        <div style={divStyle}>
          &emsp;&emsp;参数：
          <Select mode="tags" style={inputStyle} placeholder="parameter" onChange={this.argsChange}>
            <Option value="null">null</Option>
          </Select>
        </div>

        <div style={divStyle}>
          &emsp;&emsp;方法：
          <Radio.Group value={this.state.type} buttonStyle="solid" onChange={this.typeChange}>
            <Radio.Button value="query">查询(query)</Radio.Button>
            <Radio.Button value="invoke">调用(invoke)</Radio.Button>
          </Radio.Group>
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
          <Button type="primary" style={buttonStyle} onClick={this.onClick}>发送</Button>
        </div>

      </div>
    );
  }
}
