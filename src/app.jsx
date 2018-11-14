// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';

import BasicLayout from './components/BasicLayout';
import UserLayout from './components/UserLayout';
import LoadingLayout from './components/LoadingLayout';

import { getConfigDBSingleton } from './util/createDB';
import getQueryBlockSingleton from './util/queryBlock';


const logger = require('electron-log');

const db = getConfigDBSingleton();


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flag: 0,
    };


    this.getChildMessage = this.getChildMessage.bind(this);
    this.getConfig = this.getConfig.bind(this);

    setTimeout(this.getConfig, 1000);
    // const qb = getQueryBlockSingleton();
    // qb.queryBlockFromFabric(0).then((results) => {
    //   console.warn(results);
    // });
    // qb.queryBlockFromDatabase(0).then((results) => {
    //   console.log('results:', results);
    // });
  }

  getConfig() {
    db.find({}, (err, data) => {
      logger.info(data);
      if (data.length === 0) {
        const tempData = {
          id: 0,
          isSign: 1,
        };
        db.insert(tempData, (error) => {
          if (error) {
            logger.info('The operation of insert into database failed');
          }
        });
        this.setState({
          flag: tempData.isSign,
        });
      } else {
        this.setState({
          flag: data[0].isSign,
        });
      }
    });
  }

  getChildMessage(newFlag) {
    this.setState({
      flag: newFlag,
    });
  }

  render() {
    if (this.state.flag === 0) {
      return (
        <LoadingLayout />
      );
    } else if (this.state.flag === 1) {
      return (
        <UserLayout onGetChildMessage={this.getChildMessage} />
      );
    }
    return (
      <BasicLayout onGetChildMessage={this.getChildMessage} />
    );
  }
}
