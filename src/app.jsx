import React from 'react';
import BasicLayout from './components/BasicLayout';
import UserLayout from './components/UserLayout';
// import demo from './components/demo';
var fs = require('fs');

export default class App extends React.Component {

  constructor(props) {
    super(props);

    var config = JSON.parse(fs.readFileSync('config.json'));
    this.state = {
      flag:config['isSign']
    };

    this.getChildMessage = this.getChildMessage.bind(this);

  }

  getChildMessage (newFlag) {
    this.setState({
      flag: newFlag
    })
  }

  render() {
    if(this.state.flag){
      return (
        <BasicLayout onGetChildMessage = {this.getChildMessage}/>
      );
    } else {
      return (
        <UserLayout onGetChildMessage = {this.getChildMessage}/>
      );
    }

  }
}
