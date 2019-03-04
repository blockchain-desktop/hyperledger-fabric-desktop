// Copyright 2019 The hyperledger-fabric-desktop Authors. All rights reserved.
import getFabricClientSingleton from '../../src/util/fabric';

const { execSync } = require('child_process');
const logger = require('electron-log');

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

beforeAll(initFabricNetwork);

afterAll(clearFabricNetwork);


describe('Fabric Client Basic', () => {
  it('instantiate client.', () =>
    getFabricClientSingleton()
      .then((client) => {
        expect(client)
          .not
          .toBeNull();
      }));

  it('query chaincode', () => {
    const clientPromise = getFabricClientSingleton();
    return clientPromise.then((client) => {
      logger.info('OK. get client.');
      logger.info('client.channel: ', client.channels);
      client.queryCc('fabcar', 'queryAllCars', null, 'mychannel')
        .then((result) => {
          logger.info('query result: ', result);
          expect(result)
            .not
            .toBeNull();
        });
    });
  });
});

describe('Fabric Client Advanced', () => {
  describe('invoke chaincode', () => {
    it('invoke for one peer', () => {
    });

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

