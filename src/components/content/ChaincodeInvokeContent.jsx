// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Input, Select, Radio } from 'antd';
import getFabricClientSingleton from '../../util/fabric';
import { getInvokeDBSingleton } from '../../util/createDB';

const db = getInvokeDBSingleton();

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
      contract: '',
      fcn: '',
      args: '',
      type: 'query',
      language: localStorage.getItem('language'),
    };

    this.getConfig = this.getConfig.bind(this);
    this.onClick = this.onClick.bind(this);
    this.contractChange = this.contractChange.bind(this);
    this.fcnChange = this.fcnChange.bind(this);
    this.argsChange = this.argsChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.channelChange = this.channelChange.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);

    this.getConfig();
  }

  componentDidMount() {
    this.state.timer = setInterval(() => {
      logger.info('this is a timer');
    }, 60000);
  }

  componentWillUnmount() {
    if (this.state.timer != null) {
      clearInterval(this.state.timer);
      db.remove({}, { multi: true }, (err) => {
        if (err) {
          logger.info(err);
        }
      });
      const tempData = {
        channel: this.state.channel,
        contract: this.state.contract,
        fcn: this.state.fcn,
      };
      db.insert(tempData, (error) => {
        if (error) {
          logger.info('The operation of insert into database failed');
        }
      });
    }
  }

  onClick() {
    this.setState({ result: '' });

    getFabricClientSingleton().then((fabricClient) => {
      if (this.state.type === 'query') {
        fabricClient.queryCc(this.state.contract,
          this.state.fcn,
          this.state.args,
          this.state.channel)
          .then(this.onClickCallback, this.onClickCallback);
      } else if (this.state.type === 'invoke') {
        fabricClient.invokeCc(this.state.contract,
          this.state.fcn,
          this.state.args,
          this.state.channel)
          .then(this.onClickCallback, this.onClickCallback);
      } else {
        logger.error('Chaincode calling type is invalid.');
      }
    });
  }

  onClickCallback(result) {
    this.setState({ result });
  }

  getConfig() {
    db.find({}, (err, data) => {
      if (data.length !== 0) {
        this.setState({
          channel: data[0].channel,
          contract: data[0].contract,
          fcn: data[0].fcn,
        });
      }
    });
  }

  contractChange(event) {
    this.setState({ contract: event.target.value });
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
    return (
      <div style={outerDivStyle}>

        <div style={divStyle}>
          {this.state.language === 'cn' ? '通道名称：' : 'channel:'}
          <div style={inputDivStyle}>
            <Input type="text" value={this.state.channel} placeholder="channel name" style={inputStyle} onChange={this.channelChange} />
          </div>
        </div>

        <div style={divStyle}>
          {this.state.language === 'cn' ? '智能合约：' : 'contract：'}
          <div style={inputDivStyle}>
            <Input type="text" value={this.state.contract} placeholder="contract name" style={inputStyle} onChange={this.contractChange} />
          </div>
        </div>

        <div style={divStyle}>
          {this.state.language === 'cn' ? '函数名称：' : 'function ：'}
          <div style={inputDivStyle}>
            <Input type="text" value={this.state.fcn} placeholder="function name" style={inputStyle} onChange={this.fcnChange} />
          </div>
        </div>

        <div style={divStyle}>
          {this.state.language === 'cn' ? '参数：' : 'parameter：'}
          <div style={inputDivStyle}>
            <Select mode="tags" style={inputStyle} placeholder="parameter" onChange={this.argsChange}>
              <Option value="null">null</Option>
            </Select>
          </div>
        </div>

        <div style={divStyle}>
          {this.state.language === 'cn' ? '方法：' : ' method:'}
          <div style={inputDivStyle}>
            <Radio.Group value={this.state.type} buttonStyle="solid" onChange={this.typeChange}>
              <Radio.Button value="query">query</Radio.Button>
              <Radio.Button value="invoke">invoke</Radio.Button>
            </Radio.Group>
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
          <Button type="primary" style={buttonStyle} onClick={this.onClick}>{this.state.language === 'cn' ? '发送' : 'send'}</Button>
        </div>

      </div>
    );
  }
}
