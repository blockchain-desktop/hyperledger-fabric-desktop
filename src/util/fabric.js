// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import { getConfigDBSingleton } from './createDB';

const FabricClientSDK = require('fabric-client');
const FabricCAClientSDK = require('fabric-ca-client');
const path = require('path');
const util = require('util');
const fs = require('fs');
const { exec } = require('child_process');
const logger = require('electron-log');

const db = getConfigDBSingleton();


class FabricClient {
  constructor() {
    this.fabricClient = new FabricClientSDK();
    this.fabricCAClient = null;
    this.user = null;
  }

  // 抽出空挡，插入配置文件，以便集成测试
  _getConfig(configDb) {
    return new Promise((resolve, reject) => {
      configDb.find({}, (err, resultList) => {
        if (err) {
          logger.info('the operation of find documents failed!');
          reject('error');
        }
        logger.info('success get config!', ' result:', resultList);
        resolve(resultList);
      });
    });
  }

  _config(input) {
    const config = input[0];
    const self = this;
    const fabricClient = this.fabricClient;
    return new Promise((resolve) => {
      logger.info('config:', config);

      if (config.tlsPeerPath === '' || config.tlsOrdererPath === '') {
        logger.info('+++++++++++++++++');
        self.isTlsEnabled = false;
        self.peer = fabricClient.newPeer(config.peerGrpcUrl);
        self.order = fabricClient.newOrderer(config.ordererUrl);
      } else {
        logger.info('------------------');
        self.peerCert = fs.readFileSync(config.tlsPeerPath);
        self.ordererCert = fs.readFileSync(config.tlsOrdererPath);
        self.isTlsEnabled = true;
        self.peer = fabricClient.newPeer(config.peerGrpcUrl,
          { pem: Buffer.from(this.peerCert).toString(), 'ssl-target-name-override': config.peerSSLTarget });
        self.order = fabricClient.newOrderer(config.ordererUrl,
          { pem: Buffer.from(this.ordererCert).toString(), 'ssl-target-name-override': config.ordererSSLTarget });
      }

      // TODO: 考虑 ca管理 与 peer管理，分别维护两套用户
      // FIXME: CA also need to support TLS like peer/orderer above
      if (config.caServerUrl) {
        self.fabricCAClient = new FabricCAClientSDK(config.caServerUrl);
      }

      logger.info('config:', config);
      const storePath = path.join(__dirname, '../../', config.path);
      logger.info(`Store path:${storePath}`);
      self.config = config;
      self.store_path = storePath;
      self.channels = {};

      resolve();
    });
  }

  /**
   *
   * @returns {Promise<Client.User | never>}
   *
   */
  _loginUser() {
    const self = this;
    const usrName = self.config.mspid;
    logger.info('start to load member user.', ' store_path: ', self.store_path);
    return FabricClientSDK.newDefaultKeyValueStore({ path: self.store_path,
    }).then((stateStore) => {
      logger.info('get stateStore: ', stateStore);

      // assign the store to the fabric client
      self.fabricClient.setStateStore(stateStore);
      const cryptoSuite = FabricClientSDK.newCryptoSuite();

      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      const cryptoStore = FabricClientSDK.newCryptoKeyStore({ path: self.store_path });
      cryptoSuite.setCryptoKeyStore(cryptoStore);
      self.fabricClient.setCryptoSuite(cryptoSuite);

      logger.info('almost done');
      return self.fabricClient.getUserContext(usrName, true) // FIXME: usernaem和mspid可能要分开
        .then((user) => {
          logger.info('loginUser: ', user.toString());
          self.user = user;
          return Promise.resolve(user);
        });
    });
  }

  /**
   *
   * @returns {channel}
   * @private
   */
  _setupChannelOnce(channelName) {
    // setup each channel once
    let channel = this.channels[channelName];
    if (!channel) {
      logger.info('start create channel');
      channel = this.fabricClient.newChannel(channelName);
      channel.addPeer(this.peer);
      channel.addOrderer(this.order);
      this.channels[channelName] = channel;
    } else {
      logger.info(`channel(${channelName}) exists, get it from memory.`);
      channel = this.channels[channelName];
    }
    return channel;
  }

  static _argsNullHelper(args) {
    return args || [];
  }

  /**
   *  查询链码
   *  @returns {Promise<String>}
   * @param chaincodeId {string}
   * @param fcn {string}
   * @param args {[]string}
   * @param channelName {string}
   */
  queryCc(chaincodeId, fcn, args, channelName) {
    logger.info(`start query, chaincodeId:${chaincodeId}, functionName:${fcn}, args:${args}`);

    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(`Failed to create channel :: ${err}`);
      return Promise.reject(err);
    }

    const request = {
      chaincodeId,
      fcn,
      args: FabricClient._argsNullHelper(args),
    };

      // send the query proposal to the peer
    return channel.queryByChaincode(request)
      .then((queryResponses) => {
        logger.info('Query has completed, checking results');
        // queryResponses could have more than one results if there were multiple peers targets
        if (queryResponses && queryResponses.length === 1) {
          if (queryResponses[0] instanceof Error) {
            logger.error('error from query = ', queryResponses[0]);
            return Promise.reject(new Error(queryResponses[0]));
          }
          const result = queryResponses[0].toString();
          logger.info('Success, response is ', result);

          return Promise.resolve(result);
        }
        logger.info('No payloads were returned from query');
        return Promise.reject(new Error('No payloads were returned from query'));
      }).catch((err) => {
        logger.error(`Failed to query successfully :: ${err}`);
        return Promise.reject(new Error(`Failed to query successfully :: ${err}`));
      });
  }

  /**
   *  调用链码，写入账本
   *  @returns {Promise<String>}
   * @param chaincodeId {string}
   * @param fcn {string}
   * @param args {[]string}
   * @param channelName {string}
   */
  // {"pkBill":"test11", "billFrom":"huangjishun", "acceptorId":"GUOXIN_id"}
  invokeCc(chaincodeId, fcn, args, channelName, peerList, certList, sslTargetList) {
    logger.info(`start invoke, chaincodeId:${chaincodeId}, functionName:${fcn}, args:${args}`);
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
    let txID;
    const fabricClient = this.fabricClient;
    const self = this;
    return this._loginUser(this).then((user) => {
      if (user && user.isEnrolled()) {
        logger.info(`Successfully loaded user(${user.getName()}) from persistence`);
      } else {
        return Promise.reject(new Error('Failed to get user'));
      }

      // get a transaction id object based on the current user assigned to fabric client
      txID = fabricClient.newTransactionID();
      logger.info('Assigning transaction_id: ', txID._transaction_id);
      const tempTargets = [];
      tempTargets.push(self.peer);
      for (let i = 0; i < peerList.length; i++) {
        const peerCert = fs.readFileSync(certList[i]);
        const peer = self.fabricClient.newPeer((peerList[i]),
          { pem: Buffer.from(peerCert).toString(), 'ssl-target-name-override': sslTargetList[i] });
        tempTargets.push(peer);
      }
      // must send the proposal to endorsing peers
      const request = {
        targets: tempTargets,
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
        return Promise.reject(new Error('Transaction proposal was bad'));
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
        const eventHub = channel.newChannelEventHub(self.peer);
        // eventHub.setPeerAddr(self.config.peerEventUrl,
        // { pem: Buffer.from(self.peerCert).toString(),
        // 'ssl-target-name-override': self.config.sslTarget });

        // using resolve the promise so that result status may be processed
        // under the then clause rather than having the catch clause process
        // the status
        const txPromise = new Promise((resolve, reject) => {
          const handle = setTimeout(() => {
            eventHub.disconnect();
            resolve({ event_status: 'TIMEOUT' });
            // could use reject(new Error('Trnasaction did not complete within 30 seconds'));
          }, 3000);
          eventHub.registerTxEvent(transactionIDString, (tx, code) => {
            // this is the callback for transaction event status
            // first some clean up of event listener
            clearTimeout(handle);
            // eventHub.unregisterTxEvent(transactionIDString);
            // eventHub.disconnect();

            // now let the application know what happened
            const returnStatus = { event_status: code, tx_id: transactionIDString };
            if (code !== 'VALID') {
              logger.error(`The transaction was invalid, code = ${code}`);
              resolve(returnStatus);
              // could use reject(new Error('Problem with the tranaction, event status ::'+code));
            } else {
              logger.info('The transaction has been committed on peer ', eventHub.getPeerAddr());
              resolve(returnStatus);
            }
          }, (err) => {
            // this is the callback if something goes wrong
            // with the event registration or processing
            reject(new Error(`There was a problem with the eventhub ::${err}`));
          });
          eventHub.connect();
        });
        promises.push(txPromise);
        return Promise.all(promises);
      }
      logger.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
      return Promise.reject(new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'));
    }).then((results) => {
      logger.info('Send transaction promise and event listener promise have completed');
      // check the results in the order the promises were added to the promise all list
      if (results && results[0] && results[0].status === 'SUCCESS') {
        logger.info('Successfully sent transaction to the orderer.');
      } else {
        logger.error(`Failed to order the transaction. Error code: ${results[0].status}`);
        return Promise.resolve('Failed to order the transaction.');
      }

      if (results && results[1] && results[1].event_status === 'VALID') {
        logger.info('Successfully committed the change to the ledger by the peer');
      } else {
        logger.info(`Transaction failed to be committed to the ledger due to ::${results[1].event_status}`);
        return Promise.resolve('Transaction failed to be committed to the ledger.');
      }
      logger.info('Invoke result:', results);

      return Promise.resolve('Success');
    })
      .catch((err) => {
        logger.error(`Failed to invoke successfully :: ${err}`);
        return Promise.reject(new Error(`Failed to invoke successfully :: ${err}`));
      });
  }

  // TODO: go链码与GOPATH/src的处理
  /**
   * 安装链码。
   * 需要相应语言环境，如go语言。
   * @returns {Promise<String>}
   * @param chaincodePath
   * @param chaincodeName
   * @param chaincodeVersion
   */
  installCc(chaincodePath, chaincodeName, chaincodeVersion) {
    logger.info(`installing chaincode: ${chaincodePath}, ${chaincodeName}, ${chaincodeVersion}`);

    const request = {
      targets: [this.peer], // peerAddress
      chaincodePath,
      chaincodeId: chaincodeName,
      chaincodeVersion,
    };
    logger.info('installChaincode request param: ', request);
    return this.fabricClient.installChaincode(request)
      .then((results) => {
        const proposalResponses = results[0];
        if (proposalResponses && proposalResponses[0].response &&
          proposalResponses[0].response.status === 200) {
          logger.info('Transaction proposal was good:');
          return Promise.resolve('success');
        }
        logger.error('Transaction proposal was bad');
        return Promise.reject('fail');
      }, (err) => {
        logger.error(`Failed to send install proposal due to error: ${err.stack}` ? err.stack : err);
        // throw new Error(`Failed to send install proposal due to error: ${err.stack}`
        // ? err.stack : err);
        return Promise.reject('fail');
      }).catch((err) => {
        logger.error(`Failed to install :: ${err}`);
        return Promise.reject('fail');
      });
  }


  /**
   * 实例化 或 升级 链码
   * @param isInstantiate
   * @param channelName
   * @param chaincodeName
   * @param chaincodeVersion
   * @param args
   * @param endorspolicy
   * @returns {Promise}
   */
  instantiateOrUpgradeCc(isInstantiate, channelName, chaincodeName,
    chaincodeVersion, args, endorspolicy) {
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }
    logger.info('args: ', args, '&& endors-policy:', endorspolicy);

    const txID = this.fabricClient.newTransactionID();

    let endorspolicyObj;
    let argsObj;
    if (!args || args === '') {
      argsObj = null;
    } else {
      argsObj = JSON.parse(args);
    }

    if (!endorspolicy || endorspolicy === '') {
      endorspolicyObj = null;
    } else {
      endorspolicyObj = JSON.parse(endorspolicy);
    }

    const request = {
      targets: [this.peer], // peerAddress
      chaincodeId: chaincodeName,
      chaincodeVersion,
      args: argsObj,
      'endorsement-policy': endorspolicyObj,
      txId: txID,
    };

    // args: ['']
    // str: {"identities":[{"role":{"name":"member","mspId":"Org1MSP"}}],
    // "policy":{"1-of":[{"signed-by":0}]}};
    // 提案
    let promiseResult;
    if (isInstantiate) {
      promiseResult = channel.sendInstantiateProposal(request);
    } else { // upgrade
      promiseResult = channel.sendUpgradeProposal(request);
    }

    return promiseResult.then((results) => {
      const proposalResponses = results[0];
      const proposal = results[1];
      const isGood = proposalResponses && proposalResponses[0].response
        && proposalResponses[0].response.status === 200;
      if (!isGood) {
        return Promise.reject('fail');
      }
      logger.info('Transaction proposal was good:');
      // 提案成功后，提交
      return channel.sendTransaction({ proposalResponses, proposal });
    }).then((results) => {
      logger.info('Complete instantiating chaincode.', results);
      return Promise.resolve('success');
    }, (err) => {
      logger.info('Failed instantiating chaincode.', err.stack);
      return Promise.reject('fail');
    })
      .catch((err) => {
        logger.error(`Fail to instantiate chaincode. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
  }

  /**
   * 根据区块号，获取区块
   * @returns {Promise<block>}
   * @param blockNumber
   * @param channelName
   */
  queryBlock(blockNumber, channelName) {
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }

    return channel.queryBlock(blockNumber)
      .then(block => Promise.resolve(block));
  }

  /**
   * 获取区块链信息，包含区块高度height
   * @returns {Promise<BlockInfo>}
   * @param channelName
   */
  queryInfo(channelName) {
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }

    return channel.queryInfo()
      .then(blockInfo => Promise.resolve(blockInfo));
  }

  /**
   * 生成证书私钥
   * @returns {Promise<String>}
   */
  importCer(keyPath, certPath) {
    // -------------------- admin start ---------
    logger.info('start to create admin user.');
    return this.fabricClient.createUser({
      username: this.config.mspid,
      mspid: this.config.mspid,
      cryptoContent: {
        privateKey: keyPath,
        signedCert: certPath,
      },
    })
      .then((user) => {
        if (user && user.isEnrolled()) {
          logger.info('Successfully loaded user1 from persistence, user:', user.toString());
        } else {
          logger.error('Failed to get user1.... run registerUser.js');
          return Promise.reject(new Error('Failed to get user1.... run registerUser.js'));
        }
        logger.info('create fabric client success');
        return Promise.resolve('success');
      })
      .catch((err) => {
        logger.error(`Fail to instantiate chaincode. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
    // ---------------admin finish ---------------
  }

  /**
   * 查询已经安装的chaincodes
   * @returns {Promise<Array|chaincodes>}
   */
  queryInstalledChaincodes() {
    try {
      this._setupChannelOnce('mychannel200');
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }
    return this.fabricClient.queryInstalledChaincodes(this.peer)
      .then((response) => {
        if (response) {
          logger.info('Successfully get response from fabric client');
        } else {
          logger.error('Failed to get response.... ');
          return Promise.reject(new Error('Failed to get response.... '));
        }
        logger.info('response from fabric client:', response);

        return Promise.resolve(response.chaincodes);
      })
      .catch((err) => {
        logger.error(`Fail to query installed chaincodes. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
  }

  /**
   * 查询已经部署的chaincodes
   * @returns {Promise<Array|chaincodes>}
   * @param channelName 通道名字
   */
  queryInstantiatedChaincodes(channelName) {
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }

    return channel.queryInstantiatedChaincodes()
      .then((response) => {
        if (response) {
          logger.info('Successfully get response from channel');
        } else {
          logger.error('Failed to get response.... ');
          return Promise.reject(new Error('Failed to get response.... '));
        }
        logger.info('response from channel:', response);

        return Promise.resolve(response.chaincodes);
      })
      .catch((err) => {
        logger.error(`Fail to query instantiated chaincodes. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
  }


  /**
   * 查询通道
   * @returns {Promise<Array|channels>}
   * @param channelName 通道名字
   */
  queryChannels() {
    try {
      this._setupChannelOnce('mychannel');
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }
    const self = this;
    return self.fabricClient.queryChannels(self.peer)
      .then((response) => {
        if (response) {
          logger.info('Successfully get response from fabric client');
        } else {
          logger.error('Failed to get response.... ');
          return Promise.reject(new Error('Failed to get response.... '));
        }
        logger.info('response from fabric client:', response);

        return Promise.resolve(response.channels);
      })
      .catch((err) => {
        logger.error(`Fail to query channels. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
  }


  /**
   * 创建channel.tx文件
   * @returns {Promise<Array|chaincodes>}
   * @param channelName 通道名字
   */
  createChannelTX(channelName, configProfile) {
    return new Promise((resolve, reject) => {
      const txPath = path.join(__dirname, '../../resources/key/tx');
      let cmd;
      if (process.platform === 'linux') {
        cmd = 'cd ' + txPath + ' && ./configtxgen_linux -profile ' + configProfile + ' -outputCreateChannelTx ' + channelName + '.tx -channelID ' + channelName;
      } else if (process.platform === 'darwin') {
        cmd = 'cd ' + txPath + ' && ./configtxgen_darwin -profile ' + configProfile + ' -outputCreateChannelTx ' + channelName + '.tx -channelID ' + channelName;
      } else {
        cmd = 'cd ' + txPath + ' && configtxgen_windows -profile ' + configProfile + ' -outputCreateChannelTx ' + channelName + '.tx -channelID ' + channelName;
      }
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          logger.error(err);
          reject('fail');
        }
        logger.info(`stdout: ${stdout}`);
        logger.info(`stderr: ${stderr}`);
        resolve('success');
      });
    });
  }

  /**
   * 创建通道
   * @returns {Promise<Array|chaincodes>}
   * @param channelName 通道名字
   */
  createChannel(channelName, configProfile) {
    const self = this;
    return this.createChannelTX(channelName, configProfile)
      .then((msg) => {
        logger.info(msg);
        try {
          this._setupChannelOnce(channelName);
        } catch (err) {
          logger.error(err);
          return Promise.reject('fail');
        }

        const tempTxId = self.fabricClient.newTransactionID();
        const envelopeBytes = fs.readFileSync(path.join(__dirname, '../../resources/key/tx/' + channelName + '.tx'));
        const tempConfig = self.fabricClient.extractChannelConfig(envelopeBytes);
        const signature = self.fabricClient.signChannelConfig(tempConfig);
        const stringSignature = signature.toBuffer().toString('hex');
        const tempSignatures = [];
        tempSignatures.push(stringSignature);
        const request = {
          config: tempConfig,
          signatures: tempSignatures,
          name: channelName,
          orderer: self.order,
          txId: tempTxId,
        };
        return self.fabricClient.createChannel(request);
      })
      .then((result) => {
        logger.info(' response ::%j', result);

        if (result.status && result.status === 'SUCCESS') {
          return Promise.resolve('success');
        }
        logger.error('Failed to create the channel. ');
        return Promise.reject('fail');
      })
      .catch((err) => {
        logger.error(`Fail to create channels. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
  }

  /**
   * 加入通道
   * @returns {Promise<Array|chaincodes>}
   * @param channelName 通道名字
   */
  joinChannel(channelName) {
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }
    const self = this;

    const tempTxId = self.fabricClient.newTransactionID(); // 根据用户的证书构建新的事务ID，并自动生成nonce值。
    const request = {
      txId: tempTxId,
    };
    logger.info('txid', tempTxId);
    return channel.getGenesisBlock(request)
      // })
      .then((block) => {
        logger.info(' block ::%j', block.toString());
        const tempTargets = [];
        tempTargets.push(self.peer);
        const genesisBlock = block;
        const _tempTxId = self.fabricClient.newTransactionID();
        const _request = {
          targets: tempTargets,
          block: genesisBlock,
          txId: _tempTxId,
        };

        // send genesis block to the peer
        return channel.joinChannel(_request);
      })
      .then((results) => {
        logger.info(' results ::%j', results);
        // if (results && results.response && results.response.status === 200) {
        return Promise.resolve('success');
        // }
        // logger.error('Failed to create the channel. ');
        // return Promise.reject(new Error('Failed to create the channel. '));
      })
      .catch((err) => {
        logger.error(`Fail to query channels. Error message: ${err.stack}` ? err.stack : err);
        return Promise.reject('fail');
      });
  }


  /**
   * 获得peer
   * @returns {Promise<Array|chaincodes>}
   * @param channelName 通道名字
   */
  getPeers(channelName) {
    let channel;
    try {
      channel = this._setupChannelOnce(channelName);
    } catch (err) {
      logger.error(err);
      return Promise.reject('fail');
    }
    return Promise.resolve(channel.getPeers());
  }


  /**
   * 获得peer
   * @returns {Promise<Array|chaincodes>}
   * @param url peer节点地址
   * @param opts 对象
   */
  newPeer(url, opts) {
    return this.fabricClient.newPeer(url, opts);
  }


  /**
   * 连接CA，获取用户证书私钥 - 参考 https://fabric-sdk-node.github.io/release-1.4/FabricCAServices.html#enroll
   * @param {EnrollmentRequest} req - 参考 https://fabric-sdk-node.github.io/release-1.4/global.html#EnrollmentRequest
   * @return {Promise<Enrollment>} enrollment - 参考 https://fabric-sdk-node.github.io/release-1.4/global.html#Enrollment
   */
  enroll(req) {
    return this.fabricCAClient.enroll(req);
  }

  /**
   * 连接CA，注册用户 - 参考 https://fabric-sdk-node.github.io/release-1.4/FabricCAServices.html#register
   * @param {RegisterRequest} req - 参考 https://fabric-sdk-node.github.io/release-1.4/global.html#RegisterRequest
   * @return {Promise<string>} secret
   */
  register(req) {
    return this.fabricCAClient.register(req, this.user);
  }

  /**
   * 连接CA，获取当前用户更新后的证书私钥 - 参考 https://fabric-sdk-node.github.io/release-1.4/FabricCAServices.html#reenroll
   * @param {Array.<AttributeRequest>} Optional - https://fabric-sdk-node.github.io/release-1.4/FabricCAServices.html#reenroll
   * @return {Promise<Object>} keyCert - Promise for an object with "key" for private key
   *   and "certificate" for the signed certificate
   */
  reenroll(Optional) {
    return this.fabricCAClient.reenroll(this.user, Optional);
  }

  /**
   * 连接CA，吊销用户证书 - 参考 https://fabric-sdk-node.github.io/release-1.4/FabricCAServices.html#revoke
   * @param {Object} req - 参考 https://fabric-sdk-node.github.io/release-1.4/FabricCAServices.html#revoke
   * @return {Promise<>} result -
   */
  revoke(req) {
    return this.fabricCAClient.revoke(req, this.user);
  }

  // 关闭连接
  close() {
    this.peer.close();
    this.order.close();
  }
}


let __fabricClient;

export function getFabricClientSingletonHelper(dbConfig) {
  if (!__fabricClient) {
    logger.info('instantiating fabric client.');
    __fabricClient = new FabricClient();
    return __fabricClient._getConfig(dbConfig)
      .then(input => __fabricClient._config(input))
      .then(() => __fabricClient._loginUser())
      .then(() => Promise.resolve(__fabricClient));
  }
  return Promise.resolve(__fabricClient);
}

// TODO: 考虑是否去除export default，全部使用export。
// 由此保证import无需再区分 import something from 'lib' 与 import {something} from 'lib'

// FabricClient单例模式。后续考虑优化为多套身份，多个client
export default function getFabricClientSingleton() {
  return getFabricClientSingletonHelper(db);
}

export function deleteFabricClientSingleton() {
  __fabricClient = null;
}
