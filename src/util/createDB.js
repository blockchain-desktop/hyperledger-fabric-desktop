const path = require('path');

const Datastore = require('nedb');

let chaincodeDB;
let configDB;

export function getChaincodeDBSingleton() {
  if (!chaincodeDB) {
    chaincodeDB = new Datastore({ filename: path.join(__dirname, '../components/content/persistence/chaincode.db'), autoload: true });
  }
  return chaincodeDB;
}

export function getConfigDBSingleton() {
  if (!configDB) {
    configDB = new Datastore({ filename: path.join(__dirname, '../components/content/persistence/config.db'), autoload: true });
  }
  return configDB;
}
