// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import { getBlockDBSingleton } from './createDB';
import getFabricClientSingleton from './fabric';

const db = getBlockDBSingleton();

const logger = require('electron-log');

class QueryBlock {
  constructor() {
    logger.info('constructor');
    this.low = 3;
    this.high = 4;
    this.height = 0;
    this.pageSize = 4;
    this.currentPage = -1;
    this.data = [];
    this.preNum = -1;
    this.currentChannel = 'mychannel';
  }


  /**
   *  当区块链网络的区块增加时,查询区块,并把增加的区块保存到数据库中
   *  @returns {Promise<block>}
   */
  isNeedToQuery(channelName) {
    if (this.currentPage === 0) {
      const self = this;
      this.getHeight(self, channelName).then((info) => {
        if (self.height !== info.height) {
          const data = {
            start: info.height,
            end: self.height,
          };
          this._getBlockArray(data, self, channelName).then((results) => {
            logger.info('results: ', results);
            self._saveBlockToDatabase(results, channelName);
            return Promise.resolve(results);
          });
          self.height = info.height;
        }
      });
    }
  }


  /**
   *  初始化, 获取区块链网络区块的高度
   *  @returns {Promise<String>}
   *
   */
  initHeight(channelName) {
    return getFabricClientSingleton()
      .then(fabricClient => fabricClient.queryInfo(channelName))
      .then((info) => {
        this.height = info.height.low - info.height.high - 1;
        this.currentChannel = channelName;
        return Promise.resolve('init height success');
      });
  }


  /**
   *  查询info, 获取查询区块所需的信息
   *  @returns {Promise<info>}
   *  @param self this对象
   */
  getHeight(self, channelName) {
    return getFabricClientSingleton()
      .then(fabricClient => fabricClient.queryInfo(channelName))
      .then((info) => {
        const low = info.height.low - 1;
        const high = info.height.high;
        const tempLow = (low - (self.currentPage * self.pageSize)) + (self.pageSize * self.low);
        const tempStart = low > tempLow ? tempLow : low;
        const tempHigh = (low - (self.currentPage * self.pageSize)) - (self.pageSize * self.high);
        const tempEnd = high > tempHigh ? high : tempHigh;
        const result = {
          low: info.height.low - 1,
          high: info.height.high,
          height: info.height.low - info.height.high - 1,
          start: tempStart,
          end: tempEnd,
        };
        return result;
      });
  }


  /**
   *  从区块链网络中查询
   *  @returns {Promise<Array>}
   *  @param page 区块链面板当前页
   */
  queryBlockFromFabric(page, channelName) {
    logger.info('queryBlockFromFabric');
    this.currentPage = page;

    const self = this;
    return this.getHeight(self, channelName)
      .then(info => this._getBlockArray(info, self, channelName))
      .then((results) => {
        logger.info('results: ', results);
        self._saveBlockToDatabase(results, channelName);
        return Promise.resolve(results);
      });
  }


  /**
   *  查询所需的所有区块
   *  @returns {Promise<Array>}
   *  @param info 包含查询起始数据
   *  @param self this对象
   */
  _getBlockArray(info, self, channelName) {
    const promises = [];
    return getFabricClientSingleton().then((fabricClient) => {
      for (let j = info.start; j > info.end; j--) {
        const promise = new Promise((resolve) => {
          db.find({ id: j.toString(), channel: channelName }, (err, data) => {
            if (data.length === 0) {
              return fabricClient.queryBlock(j, channelName).then((block) => {
                logger.info('_getBlockArray: ', block);
                resolve(self._getBlock(block, channelName));
              });
            }
            return resolve(0);
          });
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    });
  }


  /**
   *  对单个区块进行拆分,封装
   *  @returns {block}
   *  @param block 返回的单个区块信息
   */
  _getBlock(block, channelName) {
    logger.info(block);
    if (block.header.number !== 0) {
      const tempData = {
        channel: channelName,
        key: block.header.number,
        id: block.header.number,
        num: block.data.data.length,
        hash: block.header.data_hash,
        preHash: block.header.previous_hash,
      };
      for (let i = 0; i < block.data.data.length; i++) {
        const tempTransaction = {
          tx: block.data.data[i.toString()].payload.header.channel_header.tx_id,
          creatorMSP: block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].header.creator.Mspid : '',
          endorser: block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].header.creator.Mspid : '',
          chaincodeName: block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.chaincode_id.name : '',
          type: block.data.data[i.toString()].payload.header.channel_header.typeString,
          time: block.data.data[i.toString()].payload.header.channel_header.timestamp,
          reads: {
            0: block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['0'].rwset.reads : '',
          },
          writes: {
            0: block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['0'].rwset.writes : '',
          },
        };
        if ((block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset.length : 0) > 1) {
          tempTransaction.reads[1] = block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['1'].rwset.reads : '';
          tempTransaction.writes[1] = block.data.data[i.toString()].payload.data.actions ? block.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['1'].rwset.writes : '';
        } else {
          tempTransaction.reads[1] = '';
          tempTransaction.writes[1] = '';
        }
        tempData[i.toString()] = tempTransaction;
      }
      return tempData;
    }
    return null;
  }


  /**
   *  将区块信息保存到数据库中
   *  @param results 区块列表
   */
  _saveBlockToDatabase(results, channelName) {
    logger.info('data: ', results);
    for (let i = 0, len = results.length; i < len; i++) {
      if (results[i] !== 0) {
        logger.info(results[i].id);
        this._saveBlock(results[i], channelName);
      }
    }
  }


  /**
   *  若数据库中已有该区块则不保存
   *  @param result 单个区块
   */
  _saveBlock(result, channelName) {
    db.find({ id: result.id, channel: channelName }, (err, data) => {
      if (data.length === 0) {
        db.insert(result, (error) => {
          if (error) {
            logger.info('The operation of insert into database failed');
          }
        });
      }
    });
  }


  /**
   *  从数据库中查询数据
   *  @returns {Promise<Array>}
   *  @param page 当前页数
   */
  queryBlockFromDatabase(page, channelName) {
    const promises = [];
    if (channelName !== this.currentChannel) {
      return this.initHeight(channelName).then((msg) => {
        logger.info(msg);
        const start = this.height - (4 * page);
        this.currentChannel = channelName;
        const end = start - 4 > -1 ? start - 4 : -1;
        logger.info('start: ', start);
        logger.info('end: ', end);
        for (let i = start; i > end; i--) {
          const promise = new Promise((resolve) => {
            db.find({ id: i.toString(), channel: channelName }, (err, data) => {
              if (data.length === 0) {
                resolve(getFabricClientSingleton()
                  .then(fabricClient => fabricClient.queryBlock(i, channelName))
                  .then((block) => {
                    const result = this._getBlock(block, channelName);
                    this._saveBlock(result, channelName);
                    result.key = start - i;
                    return result;
                  }));
                logger.info('get block from fabric');
              } else {
                logger.info('get block from database');
                data[0].key = start - i;
                resolve(data[0]);
              }
            });
          });
          promises.push(promise);
        }
        return Promise.all(promises);
      });
    }
    const start = this.height - (4 * page);
    if (start === this.preNum && channelName === this.currentChannel) {
      return Promise.resolve('Data does not need change');
    }
    this.preNum = start;
    this.currentChannel = channelName;
    const end = start - 4 > -1 ? start - 4 : -1;
    logger.info('start: ', start);
    logger.info('end: ', end);
    for (let i = start; i > end; i--) {
      const promise = new Promise((resolve) => {
        db.find({ id: i.toString(), channel: channelName }, (err, data) => {
          logger.info(data);
          if (data.length === 0) {
            resolve(getFabricClientSingleton()
              .then(fabricClient => fabricClient.queryBlock(i, channelName))
              .then((block) => {
                const result = this._getBlock(block, channelName);
                this._saveBlock(result, channelName);
                result.key = start - i;
                return result;
              }));
            logger.info('query block from fabric');
          } else {
            data[0].key = start - i;
            resolve(data[0]);
          }
        });
      });
      promises.push(promise);
    }
    this.queryBlockFromFabric(page, channelName).then(result => logger.info(result));
    return Promise.all(promises);
  }

  /**
   *  登出时从数据库中删除所有数据
   */
  deleteAllBlock() {
    db.remove({}, { multi: true }, (err, numRemoved) => {
      if (err) {
        logger.error(err);
      }
      logger.info('删除', numRemoved, '条记录');
    });
  }
}


let _queryBlock;

export function getQueryBlockSingleton(channelName) {
  if (!_queryBlock) {
    _queryBlock = new QueryBlock();
    return _queryBlock.initHeight(channelName).then((result) => {
      logger.info(result);
      return Promise.resolve(_queryBlock);
    });
  }
  return Promise.resolve(_queryBlock);
}

export function deleteQueryBlockSingleton() {
  _queryBlock = null;
}
