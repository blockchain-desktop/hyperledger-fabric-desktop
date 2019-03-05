// Copyright 2019 The hyperledger-fabric-desktop Authors. All rights reserved.
import { getFabricClientSingletonHelper } from '../../src/util/fabric';

const { execSync } = require('child_process');
const logger = require('electron-log');
const Datastore = require('nedb');
const path = require('path');

// Steps
// 1. start fabric network
// 2. call client functions
// 3. stop fabric network, clean up

function initFabricNetwork() {
  logger.info('Shuting down old Fabric Network.');
  let buf = execSync('cd fabric/v1.1/basic-network && ./teardown.sh');
  logger.debug(buf.toString());

  logger.info('Initiating Fabric Network.');
  buf = execSync('cd fabric/v1.1/fabcar && ./startFabric.sh');
  logger.debug(buf.toString());
}

function clearFabricNetwork() {
  // FIXME: 关闭网络需处理异步问题。 直接关闭会导致异步测试未结束，而网络被关闭。
  // 当前解决方案，在initFabricNetwork()中关闭网络

  // logger.info('clearing Fabric Network.');
  // const buf = execSync('cd fabric/v1.1/basic-network && ./teardown.sh');
  // logger.debug(buf.toString());
}

beforeAll(() => {
  jest.setTimeout(10000);
  initFabricNetwork();
});

afterAll(clearFabricNetwork);

// 注意, config.db文件中的"path"字段，对应fabric-node-sdk的用户私钥仓库路径，需根据测试环境配置，
// 目前只处理fabric v1.1-basic-network的例子，处理fabric v1.3需同时考虑sdk版本升级，以及启动脚本的调整等
const configDbForTest = new Datastore({
  filename: path.join(__dirname, '../resources/persistence/config.db'),
  autoload: true,
});

describe('Fabric Client Basic', () => {
  it('instantiate client.', () =>
    getFabricClientSingletonHelper(configDbForTest)
      .then((client) => {
        expect(client)
          .not
          .toBeNull();
      }));

  it('query chaincode', () => {
    const clientPromise = getFabricClientSingletonHelper(configDbForTest);
    return clientPromise.then((client) => {
      logger.info('OK. Got client. client.channel: ', client.channels);
      client.queryCc('fabcar', 'queryAllCars', null, 'mychannel')
        .then((result) => {
          logger.info('query result: ', result);
          expect(result)
            .not
            .toBeNull();
        })
        .catch((err) => {
          logger.error(err);
          throw new Error();
        });
    });
  });
});

describe('Fabric Client Advanced', () => {
  describe('invoke chaincode', () => {
    it('invoke for one peer', () => getFabricClientSingletonHelper(configDbForTest)
      .then(client => client.invokeCc('fabcar',
        'changeCarOwner',
        ['CAR0', 'newPerson'],
        'mychannel',
        [],
        [],
        [])
        .then((result) => {
          logger.info('invoke result: ', result);
          expect(result)
            .not
            .toBeNull();
          return Promise.resolve();
        }))
      .catch((err) => {
        logger.info('catch invoke reject');
        logger.info(err);
        throw err;
      }));

    it('invoke for multiple peers', () => {
      // TODO: to be implemented
    });
  });

  it('install chaincode', () => {

  });

  it('instantiate chaincode', () => {

  });

  it('upgrade chaincode', () => {

  });

  it('query block info', () => {

  });

  it('create channel', () => {

  });

  it('join peer to channel', () => {

  });
});

