// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// import React from 'react';

class Common {

}
Common.CURRENT_BLOCKS = 'Current Blocks';
Common.BLOCK_HASH = 'Block Hash';
Common.TRANSACTION_NUM = 'Transaction Num';
Common.BLOCK_DETAIL = 'Block Detail';
Common.BLOCK_HEADER = 'Block Header';
Common.TRANSACTIONS = 'Transactions';
Common.TRANSACTION_DETAIL = 'Transaction Detail';
Common.CHANNEL_NAME = 'channel';
Common.CONTRACT_NAME = 'chaincode ';
Common.FUNCTION_NAME = 'function';
Common.PARAMETER = 'parameter';
Common.METHOD = 'method';
Common.SEND = 'send';
Common.NEW_CONTRACT = 'New Contract';
Common.CREATE = 'create';
Common.CANCEL = 'cancel';
Common.VERSION = 'Version';
Common.NAME = 'Name';
Common.PATH = 'Path';
Common.SELECT = 'select a ';
Common.ADD_CONTRACT = 'Add contract';
Common.OPERATIONS = 'operations';
Common.LOGIN = 'Sign in';
Common.LOGIN_CONFIG = 'Fill inputs by configuration file';
Common.ADD_PEERS = 'add a peer';
Common.PEER = 'peers';
Common.SUBMIT = 'submit';
Common.CHAINCODECONSTRUCTOR = 'chaincode constructor';
Common.ENDORSEPOLICY = 'endorse policy';
Common.INTANITATE = 'Instanitate';
Common.UPGRADE = 'Upgrade Chaincode';
Common.CREATECHANNEl = 'channel name';
Common.ADDCHANNEL = 'join channel';
Common.MSP_FOLDER = 'msp folder';
Common.CONFIG_NAME = 'config name';
Common.CPNFIG_YAML = 'configtx.yaml';
Common.SUBMITCREATE = 'create';
Common.SUBMITJOIN = 'join';

// user login page, language options
Common.LOGIN_PEER_GRPC_URL = 'Peer Grpc Url';
Common.LOGIN_PEER_EVENT_URL = 'Peer Event Url';
Common.LOGIN_ORDERER_URL = 'Orderer Url';
Common.LOGIN_MSP_ID = 'MSP ID';
Common.LOGIN_CERTIFICATE = 'User Certificate';
Common.LOGIN_PRIVATE_KEY = 'User Private Key';
Common.LOGIN_PEER_TLS_CA_CERT = 'Peer TLS CA Cert';
Common.LOGIN_ORDERER_TLS_CA_CERT = 'Orderer TLS CA Cert';
Common.LOGIN_PEER_SSL_TARGET = 'Peer SSL Target';
Common.LOGIN_ORDERER_SSL_TARGET = 'Orderer SSL Target';


Common.WARN = {
  chaincodeName: 'chaincode name can not be null!',
  chaincodeVersion: 'chaincode version can not be null!',
  channelName: 'channel name can not be null!',
  chaincodePath: 'chaincode path can not be null!',
  onlyLetterAndDigital: 'only letters and digital！',
  onlyDigitalAndDot: 'only digital and dot！',
  constructorParameter: 'consturctor can not be null!',
  endorsePolicy: 'endorse policy can not be null!',
};

Common.INFO = {
  addChannelSuccess: 'Add to channel successfully!',
  createChanelSuccess: 'Channel created successfully!',
};

Common.TIP = {
  creatChannel: 'Import the configtx.yaml and certificate files before creating the channel. The configtx.yaml file defines the configuration of the channel to be created. The certificate should be consistent with the path defined by configtx.yaml.',
};

Common.ERROR = {
  certificateFailed: 'Failed to generate certificate, please select the correct certificate!',
  queryFailed: 'The query failed, please confirm the correct parameters!',
  connectFailed: 'Connection failed, node address error or tls certificate is wrong!',
  alreadyExist: 'The chaincode already exists!',
  addChannelFailed: 'Add to channel failed, please confirm whether the channel exists or whether the node is defined in the channel configuration file!',
  createChanelFailed: 'Channel created failed, please confirm that the configtx.yaml file and certificate are correct or the channel has been defined!',
};

module.exports = Common;
