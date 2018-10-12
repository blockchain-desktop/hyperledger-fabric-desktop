import React from 'react';
import BasicLayout from './components/BasicLayout';
import UserLayout from './components/UserLayout';

const fs = require('fs');

export default class App extends React.Component {

  constructor(props) {
    super(props);

    const config = JSON.parse(fs.readFileSync('config.json'));
    this.state = {
      flag: config.isSign,
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
