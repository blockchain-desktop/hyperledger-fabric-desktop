// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

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
Common.ADD_CONTRACT = '添加合约';
Common.OPERATIONS = '操作';
Common.LOGIN = '登录';
Common.ADD_PEERS = '添加一个节点';
Common.PEER = '节点';
Common.SUBMIT = '提交';
Common.CHAINCODECONSTRUCTOR = '启动参数';
Common.ENDORSEPOLICY = '背书策略';
Common.INTANITATE = '实例化链码';
Common.CREATECHANNEl = '通道名称';
Common.ADDCHANNEL = '加入通道';
Common.MSP_FOLDER = '证书目录';
Common.CONFIG_NAME = '通道配置名称';
Common.CPNFIG_YAML = 'configtx.yaml';
Common.SUBMITCREATE = '创建';
Common.SUBMITJOIN = '加入';

Common.WARN = {
  chaincodeName: '链码名称不能为空!',
  chaincodeVersion: '链码版本不能为空!',
  channelName: '通道名称不能为空!',
  chaincodePath: '链码路径不能为空!',
  onlyLetterAndDigital: '只能是字母和数字！',
  onlyDigitalAndDot: '只能是数字和点！',
  constructorParameter: '启动参数不能为空!',
  endorsePolicy: '背书策略不能为空!',
};

Common.INFO = {
  addChannelSuccess: '加入通道成功!',
  createChanelSuccess: '创建通道成功!',
};

Common.TIP = {
  creatChannel: '在创建通道前先将configtx.yaml和证书文件导入，configtx.yaml文件定义了将要创建通道的配置，证书请与configtx.yaml所定义的路径保持一致。',
};

Common.ERROR = {
  instatiateTwice: '该链码已经被实例化了!',
  certificateFailed: '生成证书失败，请选择正确的证书!',
  queryFailed: '查询失败请确认参数是否正确!',
  connectFailed: '连接失败，节点地址错误或tls证书错误！',
  addChannelFailed: '添加节点失败，请确认通道是否存在或节点是否在通道配置文件中定义！',
  createChanelFailed: '创建通道失败，请确认configtx.yaml文件和证书是否正确或通道是否已经被定义！',
};

module.exports = Common;
