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
describe('fabric v1.1 basic-network', () => {
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
    jest.setTimeout(30000);
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
        return client.queryCc('fabcar', 'queryAllCars', null, 'mychannel')
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
      // FIXME: invoke 后测试进程无法正常结束，可能存在连接或其他调用未断开。待查因解决
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

    describe('manage chaincode', () => {
      it('install chaincode', () => getFabricClientSingletonHelper(configDbForTest)
        .then(client =>
          // FIXME: 需处理GOPATH依赖的问题

          client.installCc('fabcar', 'yetAnotherfabcar', '2.0')
            .then((result) => {
              logger.info('install chaincode result: ', result);
              expect(result)
                .not
                .toBeNull();
            }),
        )
        .catch((err) => {
          logger.info('install chaincode error: ', err);
          throw err;
        }));

      it('instantiate chaincode', () => {
        const ccName = 'instFabcar';
        return getFabricClientSingletonHelper(configDbForTest)
          .then(client => client.installCc('fabcar', ccName, '1.0')
            .then((result) => {
              expect(result)
                .not
                .toBeNull();
              return Promise.resolve(client);
            }))
          .then((client) => {
            jest.setTimeout(100000);
            return client.instantiateOrUpgradeCc(true, 'mychannel', ccName, '1.0', null, null)
              .then((result) => {
                logger.info('instantiateOrUpgradeCc result: ', result);
                expect(result)
                  .not
                  .toBeNull();
                jest.setTimeout(30000);
              });
          })
          .catch((err) => {
            logger.info('instantiate chaincode error: ', err);
            throw err;
          });
      });

      it('upgrade chaincode', () => {
        jest.setTimeout(120000);
        const ccName = 'upgradeFabcar';
        return getFabricClientSingletonHelper(configDbForTest)
          .then(client => client.installCc('fabcar', ccName, '1.0')
            .then(() => client.instantiateOrUpgradeCc(true, 'mychannel', ccName, '1.0', null, null))
            // 等待链码实例化容器启动，否则升级链码会失败
            .then(() => new Promise(resolve => setTimeout(resolve, 10000)))
            .then(() => client.installCc('fabcar', ccName, '2.0'))
            .then(() => client.instantiateOrUpgradeCc(false, 'mychannel', ccName, '2.0', null, null)
              .then((result) => {
                logger.info('UpgradeCc result: ', result);
                expect(result)
                  .not
                  .toBeNull();
                jest.setTimeout(30000);
              })))
          .catch((err) => {
            logger.info('instantiate chaincode error: ', err);
            throw err;
          });
      });
    });


    it('query block info', () => getFabricClientSingletonHelper(configDbForTest)
      .then(client => client.queryBlock(0, 'mychannel')
        .then((result) => {
          logger.info('query block result: ', result);
          expect(result)
            .not
            .toBeNull();
        }))
      .catch((err) => {
        throw err;
      }));

    describe('manage channel', () => {
      it('create channel', () =>
        // FIXME: 创建通道，目前依赖contenct类中，复制configtx.yaml文件到指定目录下，需考虑如何测试这一步
        getFabricClientSingletonHelper(configDbForTest)
          .then(client => client.createChannel('createtestchannel', 'OneOrgChannel')
            .then((result) => {
              logger.info('createChannel result: ', result);
              expect(result)
                .not
                .toBeNull();
            }))
          .catch((err) => {
            throw err;
          }),
      );

      it('join peer to channel', () => {
        const chanName = 'jointestchannel';
        return getFabricClientSingletonHelper(configDbForTest)
          .then(client => client.createChannel(chanName, 'OneOrgChannel')
            .then((result) => {
              logger.info('createChannel result: ', result);
              expect(result)
                .not
                .toBeNull();
            })
            .then(() => client.joinChannel(chanName)
              .then((result) => {
                logger.info('joinChannel result: ', result);
                expect(result)
                  .not
                  .toBeNull();
              })))
          .catch((err) => {
            throw err;
          });
      });
    });
  });

  // TODO: configDbForTest的持久化数据参数,包含admin证书登入过程。 目前由fabricClient类的外部维护，考虑是否内部维护。
  describe('fabric CA management', () => {
    it('enroll admin user', () => {
      const req = {
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw',
      };

      return getFabricClientSingletonHelper(configDbForTest)
        .then((client) => {
          return client.enroll(req);
        })
        .then((enrollment) => {
          logger.info('enroll user, get enrollment: ', enrollment);
          expect(enrollment).not.toBeNull();
        })
        .catch((err) => {
          throw err;
        });
    });

    it('enroll to get a TLS certficate', () => {
      const req = {
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw',
        // profile: // TODO:
      };

      return getFabricClientSingletonHelper(configDbForTest)
        .then((client) => {
          return client.enroll(req);
        })
        .then((enrollment) => {
          expect(enrollment).not.toBeNull();
        })
        .catch((err) => {
          throw err;
        });
    });


    it('register user', () => {
      const userId = 'user1';

      return getFabricClientSingletonHelper(configDbForTest)
        .then((client) => {
          const regReq = { enrollmentID: userId, affiliation: 'org1.department1', role: 'client' };
          // 默认已登入admin用户，否则内部将报错
          return client.register(regReq)
            .then((secret) => {
              logger.info('registering successfully, user secret: ', secret);
              expect(secret).not.toBeNull();

              const enrReq = {
                enrollmenID: userId,
                enrollmenSecret: secret,
              };
              return client.enroll(enrReq);
            })
            .then((enrollment) => {
              expect(enrollment).not.toBeNull();
            });
        })
        .catch((err) => {
          throw err;
        });
    });

    it('revoke user', () => {
      const userId = 'user1';
      return getFabricClientSingletonHelper(configDbForTest)
        .then((client) => {
          const req = {
            enrollmentID: userId,
          };
          return client.revoke(req);
        })
        .then((result) => {
          expect(result).not.toBeNull();
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});

describe('fabric v1.3 fabric-ca network', () => {
  // TODO
});
