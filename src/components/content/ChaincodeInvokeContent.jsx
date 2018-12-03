// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Input, Select, Radio, message } from 'antd';
import getFabricClientSingleton from '../../util/fabric';

const Common = localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common');

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
      channelList: [],
      contractList: {},
    };

    this.onClick = this.onClick.bind(this);
    this.contractChange = this.contractChange.bind(this);
    this.fcnChange = this.fcnChange.bind(this);
    this.argsChange = this.argsChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.channelChange = this.channelChange.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);

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
          this.state.channel)
          .then(this.onClickCallback, this.errorHandler);
      } else {
        logger.error('Chaincode calling type is invalid.');
      }
    });
  }

  onClickCallback(result) {
    this.setState({ result });
  }

  errorHandler() {
    message.error(Common.ERROR.queryFailed);
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
  }

  channelChange(value) {
    this.setState({ channel: value, contract: this.state.contractList[value] ? this.state.contractList[value][0] : '' });
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
          {Common.CHANNEL_NAME}
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
          {Common.CONTRACT_NAME}
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
          {Common.FUNCTION_NAME}
          <div style={inputDivStyle}>
            <Input type="text" value={this.state.fcn} placeholder="function name" style={inputStyle} onChange={this.fcnChange} />
          </div>
        </div>

        <div style={divStyle}>
          {Common.PARAMETER}
          <div style={inputDivStyle}>
            <Select mode="tags" style={inputStyle} placeholder="parameter" onChange={this.argsChange}>
              <Option value="null">null</Option>
            </Select>
          </div>
        </div>

        <div style={divStyle}>
          {Common.METHOD}
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
          <Button type="primary" style={buttonStyle} onClick={this.onClick}>{Common.SEND}</Button>
        </div>

      </div>
    );
  }
}
