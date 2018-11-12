
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode Invoke
 */

const Fabric_Client = require('fabric-client');
const path = require('path');
const util = require('util');
const os = require('os');

//
const fabric_client = new Fabric_Client();

// setup the fabric network
const channel = fabric_client.newChannel('mychannel');
const peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
const order = fabric_client.newOrderer('grpc://localhost:7050');
channel.addOrderer(order);

//
let member_user = null;
const store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:' + store_path);
let tx_id = null;

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path,
}).then((state_store) => {
  // assign the store to the fabric client
  fabric_client.setStateStore(state_store);
  const crypto_suite = Fabric_Client.newCryptoSuite();
  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  const crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
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

  // get a transaction id object based on the current user assigned to fabric client
  tx_id = fabric_client.newTransactionID();
  console.log('Assigning transaction_id: ', tx_id._transaction_id);

  // createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
  // changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Dave'],
  // must send the proposal to endorsing peers
  const request = {
    // targets: let default to the peer assigned to the client
    chaincodeId: 'fabcar',
    fcn: '',
    args: [''],
    chainId: 'mychannel',
    txId: tx_id,
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
    console.log('Transaction proposal was good');
  } else {
    console.error('Transaction proposal was bad');
  }
  if (isProposalGood) {
    console.log(util.format(
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
    const transaction_id_string = tx_id.getTransactionID(); // Get the transaction ID string to be used by the event processing
    const promises = [];

    const sendPromise = channel.sendTransaction(request);
    promises.push(sendPromise); // we want the send transaction first, so that we know where to check status

    // get an eventhub once the fabric client has a user assigned. The user
    // is required bacause the event registration must be signed
    const event_hub = fabric_client.newEventHub();
    event_hub.setPeerAddr('grpc://localhost:7053');

    // using resolve the promise so that result status may be processed
    // under the then clause rather than having the catch clause process
    // the status
    const txPromise = new Promise((resolve, reject) => {
      const handle = setTimeout(() => {
        event_hub.disconnect();
        resolve({ event_status: 'TIMEOUT' }); // we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
      }, 3000);
      event_hub.connect();
      event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
        // this is the callback for transaction event status
        // first some clean up of event listener
        clearTimeout(handle);
        event_hub.unregisterTxEvent(transaction_id_string);
        event_hub.disconnect();

        // now let the application know what happened
        const return_status = { event_status: code, tx_id: transaction_id_string };
        if (code !== 'VALID') {
          console.error('The transaction was invalid, code = ' + code);
          resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
        } else {
          console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
          resolve(return_status);
        }
      }, (err) => {
        // this is the callback if something goes wrong with the event registration or processing
        reject(new Error('There was a problem with the eventhub ::' + err));
      });
    });
    promises.push(txPromise);

    return Promise.all(promises);
  }
  console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
  throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
})
  .then((results) => {
    console.log('Send transaction promise and event listener promise have completed');
    // check the results in the order the promises were added to the promise all list
    if (results && results[0] && results[0].status === 'SUCCESS') {
      console.log('Successfully sent transaction to the orderer.');
    } else {
      console.error('Failed to order the transaction. Error code: ' + response.status);
    }

    if (results && results[1] && results[1].event_status === 'VALID') {
      console.log('Successfully committed the change to the ledger by the peer');
    } else {
      console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
    }
  })
  .catch((err) => {
    console.error('Failed to invoke successfully :: ' + err);
  });
