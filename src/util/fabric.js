var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');
var path = require('path');
var util = require('util');
var os = require('os');
var fs=require('fs');


function readAllFiles(dir) {
  var files = fs.readdirSync(dir);
  var certs = [];
  files.forEach((file_name) => {
    let file_path = path.join(dir,file_name);
    console.debug(' looking at file ::'+file_path);
    let data = fs.readFileSync(file_path);
    certs.push(data);
  });
  return certs;
}

class FabricClient {

  constructor() {
    // TODO: 若配置更新，如何调整？
    let fabric_client = new Fabric_Client();

    let config = JSON.parse(fs.readFileSync('config.json'));
    console.log('config:', config);

    let store_path = path.join(config['path']);
    console.log('Store path:'+store_path);

    this.fabric_client = fabric_client;
    this.config = config;
    this.store_path = store_path;
    this.channels = {}; // {channelName: channel}
  }

  /**
   *
   * @returns {Promise<Client.User | never>}
   * @private
   */
  _enrollUser(userName) {
    let usrName = userName ? userName: 'user1'

    // TODO: 生成admin的逻辑，待删除
    // -------------------- admin start ---------
    // if (usrName == 'Org1Admin') {
    //   console.log("start to create admin user.")
    //   var keyPath = '/Users/dengyi/Documents/Developments/nodepath/hyperledger-fabric-desktop-demo/fabric/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/';
    //   var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
    //   var certPath = '/Users/dengyi/Documents/Developments/nodepath/hyperledger-fabric-desktop-demo/fabric/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts';
    //   var certPEM = readAllFiles(certPath)[0];
    //
    //   Promise.resolve(
    //     this.fabric_client.createUser({
    //         username: "Org1Admin",
    //         mspid: "Org1MSP",
    //         cryptoContent: {
    //           privateKeyPEM: keyPEM,
    //           signedCertPEM: certPEM,
    //         }
    //       }
    //     )
    //   )
    // }
    // ---------------admin finish ---------------

    console.log("start to load member user.")
    return Fabric_Client.newDefaultKeyValueStore({ path: this.store_path
    }).then((state_store) => {
      // assign the store to the fabric client
      this.fabric_client.setStateStore(state_store);
      var crypto_suite = Fabric_Client.newCryptoSuite();

      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      var crypto_store = Fabric_Client.newCryptoKeyStore({path: this.store_path});
      crypto_suite.setCryptoKeyStore(crypto_store);
      this.fabric_client.setCryptoSuite(crypto_suite);

      return this.fabric_client.getUserContext(usrName, true);
    })
  }


  _setupChannelOnce(channelName) {
    // setup each channel once
    let channel = this.channels[channelName];
    if (!channel) {
      channel = this.fabric_client.newChannel(channelName);
      var peer = this.fabric_client.newPeer(this.config['peer']);
      channel.addPeer(peer);
      var order = this.fabric_client.newOrderer('grpc://localhost:7050') // FIXME: 作为参数传入
      channel.addOrderer(order);

      this.channels[channelName] = channel;
    } else {
      channel = this.channels[channelName];
    }
    return channel;
  }

  _argsNullHelper(args) {
    return args ? args : []
  }

  /**
   *  查询链码
   * @param callback {function(string)}  回调函数，参数为字符串结果
   * @param chaincodeId {string}
   * @param fcn {string}
   * @param args {[]string}
   * @param channelName {string}
   */
  queryCc(callback, chaincodeId, fcn, args, channelName) {
    console.log(`start query, chaincodeId:${chaincodeId}, functionName:${fcn}, args:${args}`)

    let channel = this._setupChannelOnce(channelName);
    this._enrollUser().then((user_from_store) => {
      if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded user1 from persistence, user:', user_from_store);
      } else {
        throw new Error('Failed to get user1.... run registerUser.js');
      }

      const request = {
        chaincodeId: chaincodeId,
        fcn: fcn,
        args: this._argsNullHelper(args) // FIXME: caller should be responsible for checking input.
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
          var result = query_responses[0].toString();
          console.log("Response is ", result);

          callback(result);
        }
      } else {
        console.log("No payloads were returned from query");
      }
    }).catch((err) => {
      console.error('Failed to query successfully :: ' + err);
    });

  }

  /**
   *  调用链码，写入账本
   * @param callback {function(string)}  回调函数，参数为字符串结果
   * @param chaincodeId {string}
   * @param fcn {string}
   * @param args {[]string}
   * @param channelName {string}
   */
  invokeCc(callback, chaincodeId, fcn, args, channelName) {
    console.log(`start invoke, chaincodeId:${chaincodeId}, functionName:${fcn}, args:${args}`)
    let channel = this._setupChannelOnce(channelName);
    let tx_id;
    let fabric_client = this.fabric_client;

    this._enrollUser().then((user_from_store) => {
      if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded user1 from persistence');
      } else {
        throw new Error('Failed to get user1.... run registerUser.js');
      }

      // get a transaction id object based on the current user assigned to fabric client
      tx_id = fabric_client.newTransactionID();
      console.log("Assigning transaction_id: ", tx_id._transaction_id);

      // createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
      // changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Dave'],
      // must send the proposal to endorsing peers
      var request = {
        //targets: let default to the peer assigned to the client
        chaincodeId: chaincodeId,
        fcn: fcn,
        args: this._argsNullHelper(args),
        chainId: channelName,
        txId: tx_id
      };

      // send the transaction proposal to the peers
      return channel.sendTransactionProposal(request);
    }).then((results) => {
      var proposalResponses = results[0];
      var proposal = results[1];
      let isProposalGood = false;
      if (proposalResponses && proposalResponses[0].response &&
        proposalResponses[0].response.status === 200) {
        isProposalGood = true;
        console.log('Transaction proposal was good:');
      } else {
        console.error('Transaction proposal was bad');
      }
      if (isProposalGood) {
        console.log(util.format(
          'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
          proposalResponses[0].response.status, proposalResponses[0].response.message));

        // build up the request for the orderer to have the transaction committed
        var request = {
          proposalResponses: proposalResponses,
          proposal: proposal
        };

        // set the transaction listener and set a timeout of 30 sec
        // if the transaction did not get committed within the timeout period,
        // report a TIMEOUT status
        var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
        var promises = [];

        var sendPromise = channel.sendTransaction(request);
        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

        // get an eventhub once the fabric client has a user assigned. The user
        // is required bacause the event registration must be signed
        let event_hub = fabric_client.newEventHub();
        event_hub.setPeerAddr('grpc://localhost:7053'); // FIXME: 事件监听地址端口，需作为参数传入

        // using resolve the promise so that result status may be processed
        // under the then clause rather than having the catch clause process
        // the status
        let txPromise = new Promise((resolve, reject) => {
          let handle = setTimeout(() => {
            event_hub.disconnect();
            resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
          }, 3000);
          event_hub.connect();
          event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
            // this is the callback for transaction event status
            // first some clean up of event listener
            clearTimeout(handle);
            event_hub.unregisterTxEvent(transaction_id_string);
            event_hub.disconnect();

            // now let the application know what happened
            var return_status = {event_status : code, tx_id : transaction_id_string};
            if (code !== 'VALID') {
              console.error('The transaction was invalid, code = ' + code);
              resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
            } else {
              console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
              resolve(return_status);
            }
          }, (err) => {
            //this is the callback if something goes wrong with the event registration or processing
            reject(new Error('There was a problem with the eventhub ::'+err));
          });
        });
        promises.push(txPromise);

        return Promise.all(promises);
      } else {
        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
      }
    }).then((results) => {
      console.log('Send transaction promise and event listener promise have completed');
      // check the results in the order the promises were added to the promise all list
      if (results && results[0] && results[0].status === 'SUCCESS') {
        console.log('Successfully sent transaction to the orderer.');
      } else {
        console.error('Failed to order the transaction. Error code: ' + response.status);
      }

      if(results && results[1] && results[1].event_status === 'VALID') {
        console.log('Successfully committed the change to the ledger by the peer');
      } else {
        console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
      }
      console.log("Invoke result:", results)

      callback('调用成功') // TODO: invoke的结果获取

    }).catch((err) => {
      console.error('Failed to invoke successfully :: ' + err);
    });

  }

  // TODO: go链码与GOPATH/src的处理
  /**
   * 安装链码。
   * 需要相应语言环境，如go语言。
   * @param callback
   * @param chaincodePath
   * @param chaincodeName
   * @param chaincodeVersion
   */
  installCc(callback, chaincodePath, chaincodeName, chaincodeVersion) {
    let username = 'Org1Admin';

    this._enrollUser(username).then((user_from_store) => {
        console.log('Successfully loaded user from persistence, user:', user_from_store);

        let request = {
          targets:  [this.fabric_client.newPeer(this.config['peer'])], // peerAddress
          chaincodePath: chaincodePath,
          chaincodeId: chaincodeName,
          chaincodeVersion: chaincodeVersion
        };
        return this.fabric_client.installChaincode(request);
    }).then((results) => {
      var proposalResponses = results[0];
      var proposal = results[1];
      let isProposalGood = false;
      if (proposalResponses && proposalResponses[0].response &&
        proposalResponses[0].response.status === 200) {
        isProposalGood = true;
        console.log('Transaction proposal was good:');
      } else {
        console.error('Transaction proposal was bad');
      }

      // 安装成功
      let msg;
      if (isProposalGood) {
        msg = '安装链码成功';
        console.log(msg);
      } else {
        msg = '安装链码失败'
        console.error(msg);
      }
      callback(msg);
    }, (err) => {
      console.error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
      throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
    })
  }


  /**
   * 实例化链码
   * @param callback
   * @param channelName
   * @param chaincodeName
   * @param chaincodeVersion
   * @param args
   */
  instantiateCc(callback, channelName, chaincodeName, chaincodeVersion, args) {
    let username = 'Org1Admin';
    let channel = this._setupChannelOnce(channelName);
    let tx_id;

    this._enrollUser(username).then((user_from_store) => {
      console.log('Successfully loaded user from persistence, user:', user_from_store);

      tx_id = this.fabric_client.newTransactionID();
      let request = {
        targets:  [this.fabric_client.newPeer(this.config['peer'])], // peerAddress
        chaincodeId: chaincodeName,
        chaincodeVersion: chaincodeVersion,
        args: args,
        txId: tx_id
      };

      // 提案
      return channel.sendInstantiateProposal(request);
    }).then((results) => {
      var proposalResponses = results[0];
      var proposal = results[1];
      let isProposalGood = false;
      if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
        isProposalGood = true;
        console.log('Transaction proposal was good:');
      } else {
        console.error('Transaction proposal was bad');
      }

      // 提案成功后，提交
      let request = {
        proposalResponses: proposalResponses,
        proposal: proposal
      };

      return channel.sendTransaction(request);
    }).then((results) => {
      console.log("Complete instantiating chaincode.");
      callback('实例化链码成功');
    }).catch((err) => {
      console.error("Fail to instantiate chaincode. Error message: " + err.stack ? err.stack : err);
    })
  }

  /**
   * 根据区块号，获取区块
   * @param callback
   * @param blockNumber
   * @param channelName
   */
  queryBlock(callback, blockNumber, channelName) {
    let channel = this._setupChannelOnce(channelName)

    this._enrollUser().then((user) => {
      return channel.queryBlock(blockNumber)
    }).then((block) => {
      console.log("block:", block, block.toString())
      callback(block)
    })
  }

  /**
   * 获取区块链信息，包含区块高度height
   * @param callback
   * @param channelName
   */
  queryInfo(callback, channelName) {
    let channel = this._setupChannelOnce(channelName)

    this._enrollUser().then((user) => {
      return channel.queryInfo()
    }).then((blockchainInfo) => {
      console.log("blockchainInfo:", blockchainInfo, blockchainInfo.toString())
      callback(blockchainInfo)
    })

  }

}


var __fabricClient

// FabricClient单例模式。后续考虑优化为多套身份，多个client
export default function getFabricClientSingleton() {
  if (!__fabricClient) {
    __fabricClient = new FabricClient();
  }
  return __fabricClient;
}
