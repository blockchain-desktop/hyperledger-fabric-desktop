// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';

import BasicLayout from './components/BasicLayout';
import UserLayout from './components/UserLayout';

import { getConfigDBSingleton } from './util/createDB';

const db = getConfigDBSingleton();


export default class App extends React.Component {

  constructor(props) {
    super(props);

    db.find({}, (err, data) => {
      this.setState({
        flag: data[0].isSign,
      });
    });

    this.state = {
      flag: true,
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
