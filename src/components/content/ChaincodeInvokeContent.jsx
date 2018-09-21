import React from 'react';
import { Button, Input, Select, Radio} from 'antd';

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

const { TextArea } = Input;



export default class ChaincodeInvokeContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: '',
      value: '',
                                    // queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
      chaincodeId: 'fabcar',        // queryAllCars chaincode function - requires no arguments , ex: args: [''],
      fcn: 'queryAllCars',
      args: '',
      type: 'invoke'
    };

    this.onClick = this.onClick.bind(this);
    this.chaincodeIdChange = this.chaincodeIdChange.bind(this);
    this.fcnChange = this.fcnChange.bind(this);
    this.argsChange = this.argsChange.bind(this);
    this.typeChange = this.typeChange.bind(this);

  }

  chaincodeIdChange(event){
    this.setState({chaincodeId: event.target.value})
  }

  fcnChange(event){
    this.setState({fcn: event.target.value})
  }

  argsChange(value){
    if(value != null)
      this.setState({args: value})
  }

  typeChange(event){
    this.setState({type: event.target.value})
  }






  onClick(e) {

    var fabric_client = new Fabric_Client();

    // setup the fabric network
    var channel = fabric_client.newChannel('mychannel');
    var peer = fabric_client.newPeer('grpc://localhost:7051');
    channel.addPeer(peer);

    //
    var member_user = null;

    var store_path = path.join(__dirname, 'resources/hfc-key-store');
    console.log('Store path:'+store_path);
    var tx_id = null;
    var result = '';
    this.setState({
      result: result,
    });





    // ----------------------------------------------
    // TODO: 导入fabric query函数。
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    Fabric_Client.newDefaultKeyValueStore({ path: store_path
    }).then((state_store) => {
      // assign the store to the fabric client
      fabric_client.setStateStore(state_store);
      var crypto_suite = Fabric_Client.newCryptoSuite();
      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
      crypto_suite.setCryptoKeyStore(crypto_store);
      fabric_client.setCryptoSuite(crypto_suite);

      // get the enrolled user from persistence, this user will sign all requests
      return fabric_client.getUserContext('user1', true);
    }).then((user_from_store) => {
      if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded user1 from persistence');
        member_user = user_from_store;
      } else {
        throw new Error('Failed to get user1.... run registerUser.js');
      }

      const request = {
        //targets : --- letting this default to the peers assigned to the channel
        chaincodeId: this.state.chaincodeId,
        fcn: this.state.fcn,
        //type:this.state.type,
        args: [this.state.args]
      };



      // send the query proposal to the peer
      return channel.queryByChaincode(request);
    }).then((query_responses) => {
      console.log("Query has completed, checking results");
      // query_responses could have more than one  results if there multiple peers were used as targets
      if (query_responses && query_responses.length == 1) {
        if (query_responses[0] instanceof Error) {
          console.error("error from query = ", query_responses[0]);
        } else {
          console.log("Response is ", query_responses[0].toString());
          this.setState({
            result: query_responses[0].toString()
          });
        }
      } else {
        console.log("No payloads were returned from query");
      }
    }).catch((err) => {
      console.error('Failed to query successfully :: ' + err);
    });
  }

  render() {
    return (
      <div>
        <div style={{ margin: '24px 0' }}>
          智能合约：
          <Input  type="text" value={this.state.chaincodeId} style={{ width: '70%'  }} onChange={this.chaincodeIdChange}/>
          {this.state.chaincodeId}
        </div>

        <div style={{ margin: '24px 0' }}>
          函数名称：
          <Input  type="text" value={this.state.fcn} style={{ width: '70%'  }} onChange={this.fcnChange}/>
          {this.state.fcn}
        </div>

        <div style={{ margin: '24px 0' }}>
          &emsp;&emsp;参数：
          <Select mode="tags" style={{ width: '70%' }} placeholder="parameter" onChange={this.argsChange}>
            <Option value="null">null</Option>
          </Select>
          {this.state.args}
        </div>

        <div style={{ margin: '24px 0' }}>
          &emsp;&emsp;方法：
          <Radio.Group value={this.state.type} buttonStyle="solid" onChange={this.typeChange}>
            <Radio.Button value="invoke">调用</Radio.Button>
            <Radio.Button value="query">查询</Radio.Button>
          </Radio.Group>
          {this.state.type}
        </div>

        <div style={{ margin: '24px 0' }}>
          <TextArea placeholder='result' value={this.state.result} autosize={{ minRows: 8, maxRows: 8 }} />
        </div>


        <div style={{ margin: '24px 0' }}>
          <Button type="primary" style={{ width: '100%' }} onClick={this.onClick}>发送</Button>
        </div>

      </div>
    );
  }
}
