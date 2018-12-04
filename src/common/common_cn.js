class Common {

}
Common.CURRENT_BLOCKS = '最近区块';
Common.BLOCK_HASH = '哈希值';
Common.TRANSACTION_NUM = '交易数量';
Common.BLOCK_DETAIL = '区块详情';
Common.BLOCK_HEADER = '区块头信息';
Common.TRANSACTIONS = '交易列表';
Common.TRANSACTION_DETAIL = '交易详情';
Common.CHANNEL_NAME = '通道';
Common.CONTRACT_NAME = '链码';
Common.FUNCTION_NAME = '函数';
Common.PARAMETER = '参数';
Common.METHOD = '方法';
Common.SEND = '发送';
Common.NEW_CONTRACT = '添加合约';
Common.CREATE = '确认';
Common.CANCEL = '取消';
Common.VERSION = '版本';
Common.NAME = '名称';
Common.PATH = '路径';
Common.SELECT = '选择一个';

Common.WARN = {
  chaincodeName: '链码名称不能为空!',
  chaincodeVersion: '链码版本不能为空!',
  channelName: '通道名称不能为空!',
  chaincodePath: '链码路径不能为空!',
  onlyLetterAndDigital: '只能是字母和数字！',
  onlyDigitalAndDot: '只能是数字和点！',
};


Common.ERROR = {
  certificateFailed: 'Failed to generate certificate, please select the correct certificate!',
  queryFailed: 'The query failed, please confirm the correct parameters!',
  connectFailed: 'Connection failed, node address error or tls certificate is wrong',
};

module.exports = Common;
