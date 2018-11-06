// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

const FabricClientSDK = require('fabric-client');
const path = require('path');
const util = require('util');
const fs = require('fs');

const logger = require('electron-log');

class FabricClient {
  constructor() {
    // TODO: 若配置更新，如何调整？

    // FIXME: 解决异步问题,将配置从config.db里面读取
    const fabricClient = new FabricClientSDK();

    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json')));

    if (config.tlsPeerPath === '' || config.tlsOrdererPath === '') {
      logger.info('+++++++++++++++++');
      this.flag = false;
    } else {
      logger.info('------------------');
      this.peerCert = fs.readFileSync(config.tlsPeerPath);
      this.orderersCert = fs.readFileSync(config.tlsOrdererPath);
      this.flag = true;
    }


    const storePath = path.join(__dirname, '../../', config.path);
    logger.info(`Store path:${storePath}`);

    this.fabric_client = fabricClient;
    this.config = config;
    this.store_path = storePath;
    this.channels = {}; // {channelName: channel}
  }

  /**
   *
   * @returns {Promise<Client.User | never>}
   * @private
   */
  _enrollUser() {
    const usrName = this.config.username;
    logger.info('start to load member user.');
    return FabricClientSDK.newDefaultKeyValueStore({ path: this.store_path,
    }).then((stateStore) => {
      // assign the store to the fabric client
      this.fabric_client.setStateStore(stateStore);
      const cryptoSuite = FabricClientSDK.newCryptoSuite();

      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      const cryptoStore = FabricClientSDK.newCryptoKeyStore({ path: this.store_path });
      cryptoSuite.setCryptoKeyStore(cryptoStore);
      this.fabric_client.setCryptoSuite(cryptoSuite);

      return this.fabric_client.getUserContext(usrName, true);
    });
  }


  _setupChannelOnce(channelName) {
    // setup each channel once
    let channel = this.channels[channelName];
    if (!channel) {
      logger.info('******************');
      channel = this.fabric_client.newChannel(channelName);
      let peer;
      let order;

      if (this.flag) {
        logger.info('-----------');
        peer = this.fabric_client.newPeer(this.config.peerGrpcUrl,
          { pem: Buffer.from(this.peerCert).toString(), 'ssl-target-name-override': 'peer0.org1.example.com' });
        channel.addPeer(peer);
        order = this.fabric_client.newOrderer(this.config.ordererUrl,
          { pem: Buffer.from(this.orderersCert).toString(), 'ssl-target-name-override': 'orderer.example.com' });
        channel.addOrderer(order);
      } else {
        logger.info('+++++++++++++++++');
        peer = this.fabric_client.newPeer(this.config.peerGrpcUrl);
        channel.addPeer(peer);
        order = this.fabric_client.newOrderer(this.config.ordererUrl);
        channel.addOrderer(order);
      }
      this.channels[channelName] = channel;
    } else {
      channel = this.channels[channelName];
    }
    return channel;
  }

  static _argsNullHelper(args) {
    return args || [];
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
    logger.info(`start query, chaincodeId:${chaincodeId}, functionName:${fcn}, args:${args}`);

    const channel = this._setupChannelOnce(channelName);
    this._enrollUser().then((user) => {
      if (user && user.isEnrolled()) {
        logger.info('Successfully loaded user1 from persistence, user:', user.toString());
      } else {
        throw new Error('Failed to get user1.... run registerUser.js');
      }

      const request = {
        chaincodeId,
        fcn,
        args: FabricClient._argsNullHelper(args),
      };

      // send the query proposal to the peer
      return channel.queryByChaincode(request);
    }).then((queryResponses) => {
      logger.info('Query has completed, checking results');
      // queryResponses could have more than one results if there were multiple peers targets
      if (queryResponses && queryResponses.length === 1) {
        if (queryResponses[0] instanceof Error) {
          logger.error('error from query = ', queryResponses[0]);
        } else {
          const result = queryResponses[0].toString();
          logger.info('Response is ', result);

          callback(result);
        }
      } else {
        logger.info('No payloads were returned from query');
      }
    }).catch((err) => {
      logger.error(`Failed to query successfully :: ${err}`);
    });
  }


  importCer(keyPath, certPath) {
    // -------------------- admin start ---------
    logger.info('start to create admin user.');

    this.fabric_client.createUser({
      username: this.config.username,
      mspid: 'Org1MSP',
      cryptoContent: {
        privateKey: keyPath,
        signedCert: certPath,
      },
    });
    // ---------------admin finish ---------------
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
    logger.info(`start invoke, chaincodeId:${chaincodeId}, functionName:${fcn}, args:${args}`);
    const channel = this._setupChannelOnce(channelName);
    let txID;
    const fabricClient = this.fabric_client;

    this._enrollUser().then((user) => {
      if (user && user.isEnrolled()) {
        logger.info('Successfully loaded user1 from persistence');
      } else {
        throw new Error('Failed to get user1.... run registerUser.js');
      }

      // get a transaction id object based on the current user assigned to fabric client
      txID = fabricClient.newTransactionID();
      logger.info('Assigning transaction_id: ', txID._transaction_id);

      // must send the proposal to endorsing peers
      const request = {
        // targets: let default to the peer assigned to the client
        chaincodeId,
        fcn,
        args: FabricClient._argsNullHelper(args),
        chainId: channelName,
        txId: txID,
      };

      // send the transaction proposal to the peers
      return channel.sendTransactionProposal(request);
    }).then((results) => {
      const proposalResponses = results[0];
      const proposal = results[1];
      let isProposalGood = false;
      if (proposalResponses && proposalResponses[0].response &&
        proposalResponses[0].response.status === 200) {
        isProposalGood = true;
        logger.info('Transaction proposal was good:');
      } else {
        logger.error('Transaction proposal was bad');
      }
      if (isProposalGood) {
        logger.info(util.format(
          'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
          proposalResponses[0].response.status, proposalResponses[0].response.message));

        // build up the request for the orderer to have the transaction committed
        const request = {
          proposalResponses,
          proposal,
        };

        // set the transaction listener and set a timeout of 30 sec
        // if the transaction did not get committed within the timeout period,
        // report a TIMEOUT status
        const transactionIDString = txID.getTransactionID();
        const promises = [];

        // send transaction first, so that we know where to check status
        const sendPromise = channel.sendTransaction(request);
        promises.push(sendPromise);

        // get an eventhub once the fabric client has a user assigned. The user
        // is required bacause the event registration must be signed
        const eventHub = fabricClient.newEventHub();
        eventHub.setPeerAddr(this.config.peerEventUrl);

        // using resolve the promise so that result status may be processed
        // under the then clause rather than having the catch clause process
        // the status
        const txPromise = new Promise((resolve, reject) => {
          const handle = setTimeout(() => {
            eventHub.disconnect();
            resolve({ event_status: 'TIMEOUT' });
            // could use reject(new Error('Trnasaction did not complete within 30 seconds'));
          }, 3000);
          eventHub.connect();
          eventHub.registerTxEvent(transactionIDString, (tx, code) => {
            // this is the callback for transaction event status
            // first some clean up of event listener
            clearTimeout(handle);
            eventHub.unregisterTxEvent(transactionIDString);
            eventHub.disconnect();

            // now let the application know what happened
            const returnStatus = { event_status: code, tx_id: transactionIDString };
            if (code !== 'VALID') {
              logger.error(`The transaction was invalid, code = ${code}`);
              resolve(returnStatus);
              // could use reject(new Error('Problem with the tranaction, event status ::'+code));
            } else {
              logger.info(`The transaction has been committed on peer ${eventHub._ep._endpoint.addr}`);
              resolve(returnStatus);
            }
          }, (err) => {
            // this is the callback if something goes wrong
            // with the event registration or processing
            reject(new Error(`There was a problem with the eventhub ::${err}`));
          });
        });
        promises.push(txPromise);

        return Promise.all(promises);
      }
      logger.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
      throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
    }).then((results) => {
      logger.info('Send transaction promise and event listener promise have completed');
      // check the results in the order the promises were added to the promise all list
      if (results && results[0] && results[0].status === 'SUCCESS') {
        logger.info('Successfully sent transaction to the orderer.');
      } else {
        logger.error(`Failed to order the transaction. Error code: ${results[0].status}`);
      }

      if (results && results[1] && results[1].event_status === 'VALID') {
        logger.info('Successfully committed the change to the ledger by the peer');
      } else {
        logger.info(`Transaction failed to be committed to the ledger due to ::${results[1].event_status}`);
      }
      logger.info('Invoke result:', results);

      callback('调用成功'); // TODO: invoke的结果获取
    })
      .catch((err) => {
        logger.error(`Failed to invoke successfully :: ${err}`);
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
    logger.info(`${chaincodePath}, ${chaincodeName}, ${chaincodeVersion}`);
    this._enrollUser().then((user) => {
      logger.info('Successfully loaded user from persistence, user:', user.toString());

      const request = {
        targets: [this.fabric_client.newPeer(this.config.peerGrpcUrl)], // peerAddress
        chaincodePath,
        chaincodeId: chaincodeName,
        chaincodeVersion,
      };
      return this.fabric_client.installChaincode(request);
    }).then((results) => {
      const proposalResponses = results[0];
      let isProposalGood = false;
      if (proposalResponses && proposalResponses[0].response &&
        proposalResponses[0].response.status === 200) {
        isProposalGood = true;
        logger.info('Transaction proposal was good:');
      } else {
        logger.error('Transaction proposal was bad');
      }

      // 安装成功
      let msg;
      if (isProposalGood) {
        msg = 'success';
        logger.info(msg);
      } else {
        msg = 'fail';
        logger.error(msg);
      }
      callback(msg);
    }, (err) => {
      logger.error(`Failed to send install proposal due to error: ${err.stack}` ? err.stack : err);
      throw new Error(`Failed to send install proposal due to error: ${err.stack}` ? err.stack : err);
    });
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
    const channel = this._setupChannelOnce(channelName);
    let txID;

    this._enrollUser().then((user) => {
      logger.info('Successfully loaded user from persistence, user:', user.toString());

      txID = this.fabric_client.newTransactionID();
      const request = {
        targets: [this.fabric_client.newPeer(this.config.peerGrpcUrl)], // peerAddress
        chaincodeId: chaincodeName,
        chaincodeVersion,
        args,
        txId: txID,
      };

      // 提案
      return channel.sendInstantiateProposal(request);
    }).then((results) => {
      const proposalResponses = results[0];
      const proposal = results[1];
      const isGood = proposalResponses && proposalResponses[0].response
        && proposalResponses[0].response.status === 200;

      if (!isGood) {
        throw new Error('Transaction proposal was bad');
      }

      logger.info('Transaction proposal was good:');
      // 提案成功后，提交
      const request = {
        proposalResponses,
        proposal,
      };
      return channel.sendTransaction(request);
    }).then((results) => {
      logger.info('Complete instantiating chaincode.', results);
      callback('success');
    })
      .catch((err) => {
        logger.error(`Fail to instantiate chaincode. Error message: ${err.stack}` ? err.stack : err);
        callback('fail');
      });
  }

  /**
   * 根据区块号，获取区块
   * @param callback
   * @param blockNumber
   * @param channelName
   */
  queryBlock(callback, blockNumber, channelName) {
    const channel = this._setupChannelOnce(channelName);

    this._enrollUser().then(() => channel.queryBlock(blockNumber)).then((block) => {
      logger.info('block:', block, block.toString());
      callback(block);
    });
  }

  /**
   * 获取区块链信息，包含区块高度height
   * @param callback
   * @param channelName
   */
  queryInfo(callback, channelName) {
    const channel = this._setupChannelOnce(channelName);

    this._enrollUser().then(() => channel.queryInfo()).then((blockchainInfo) => {
      logger.info('blockchainInfo:', blockchainInfo, blockchainInfo.toString());
      callback(blockchainInfo);
    });
  }
}


let __fabricClient;

// FabricClient单例模式。后续考虑优化为多套身份，多个client
export default function getFabricClientSingleton() {
  if (!__fabricClient) {
    __fabricClient = new FabricClient();
  }
  return __fabricClient;
}

export function deleteFabricClientSingleton() {
  __fabricClient = null;
}
