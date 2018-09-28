var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var fs=require('fs');

class FabricClient {

  // 回调函数 callback(result):  result为字符串结果
  queryCc(callback, chaincodeId, fcn, args, channel) {

    var fabric_client = new Fabric_Client();

    var config = JSON.parse(fs.readFileSync('config.json'));
    console.log(config);

    // setup the fabric network
    var channel = fabric_client.newChannel(channel);
    var peer = fabric_client.newPeer(config['peer']);
    channel.addPeer(peer);

    //
    var member_user = null;

    var store_path = path.join(config['path']);
    console.log('Store path:'+store_path);
    var tx_id = null;

    // ----------------------------------------------
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    Fabric_Client.newDefaultKeyValueStore({ path: store_path
    }).then((state_store) => {
      // assign the store to the fabric client
      fabric_client.setStateStore(state_store);
      var crypto_suite = Fabric_Client.newCryptoSuite();

      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
      crypto_suite.setCryptoKeyStore(crypto_store);
      fabric_client.setCryptoSuite(crypto_suite);

      // get the enrolled user from persistence, this user will sign all requests
      return fabric_client.getUserContext('user1', true);
    }).then((user_from_store) => {
      if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded user1 from persistence');
        member_user = user_from_store;
      } else {
        throw new Error('Failed to get user1.... run registerUser.js');
      }

      const request = {
        //targets : --- letting this default to the peers assigned to the channel
        chaincodeId: chaincodeId,
        fcn: fcn,
        //type:this.state.type,
        args: [args]
      };


      // send the query proposal to the peer
      return channel.queryByChaincode(request);
    }).then((query_responses) => {
      console.log("Query has completed, checking results");
      // query_responses could have more than one  results if there multiple peers were used as targets
      if (query_responses && query_responses.length == 1) {
        if (query_responses[0] instanceof Error) {
          console.error("error from query = ", query_responses[0]);
        } else {
          var result = query_responses[0].toString();
          console.log("Response is ", result);

          callback(result);
        }
      } else {
        console.log("No payloads were returned from query");
      }
    }).catch((err) => {
      console.error('Failed to query successfully :: ' + err);
    });

  }

  invokeCc() {}

  installCc() {}

  instantiateCc() {}

}


var __fabricClient

// FabricClient单例模式。后续考虑优化为多套身份，多个client
export default function getFabricClientSingleton() {
  if (!__fabricClient) {
    __fabricClient = new FabricClient();
  }
  return __fabricClient;
}
