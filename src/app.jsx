// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';

import BasicLayout from './components/BasicLayout';
import UserLayout from './components/UserLayout';

import { getConfigDBSingleton } from './util/createDB';


const logger = require('electron-log');

const db = getConfigDBSingleton();


export default class App extends React.Component {
  constructor(props) {
    super(props);

    db.find({}, (err, data) => {
      console.warn(data);
      if (data.length === 0) {
        const tempData = {
          id: 0,
          isSign: false,
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

    this.state = {
      flag: false,
    };


    this.getChildMessage = this.getChildMessage.bind(this);
  }

  getChildMessage(newFlag) {
    this.setState({
      flag: newFlag,
    });
  }

  render() {
    if (this.state.flag) {
      return (
        <BasicLayout onGetChildMessage={this.getChildMessage} />
      );
    }
    return (
      <UserLayout onGetChildMessage={this.getChildMessage} />
    );
  }
}
