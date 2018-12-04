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


Common.WARN = {
  chaincodeName: 'chaincode name can not be null!',
  chaincodeVersion: 'chaincode version can not be null!',
  channelName: 'channel name can not be null!',
  chaincodePath: 'chaincode path can not be null!',
  onlyLetterAndDigital: 'only letters and digital！',
  onlyDigitalAndDot: 'only digital and dot！',
};

Common.ERROR = {
  certificateFailed: 'Failed to generate certificate, please select the correct certificate!',
  queryFailed: 'The query failed, please confirm the correct parameters!',
  connectFailed: 'Connection failed, node address error or tls certificate is wrong',
};

module.exports = Common;
