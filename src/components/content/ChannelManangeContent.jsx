import React from 'react';
import { Select, Button, message } from 'antd';

const Option = Select.Option;
const peerData = ['peer1', 'peer2'];
const channelData = ['channel1', 'channel2'];

export default class ChannelManangeContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      peer: ' ',
      channel: ' ',
    };
    this.handlePeerChange = this.handlePeerChange.bind(this);
    this.handleChanelChange = this.handleChanelChange.bind(this);
    this.handleAddSuccess = this.handleAddSuccess.bind(this);
    this.handleAddFailed = this.handleAddFailed.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }

  handlePeerChange(value) {
    console.log('peer: ' + value);
    this.setState({ peer: value });
  }

  handleChanelChange(value) {
    console.log('channel: ' + value);
    this.setState({ channel: value });
  }

  handleAddSuccess() {
    message.success('Add to channel successfully!');
    console.log(this.state.peer);
    console.log(this.state.channel);
  }

  handleAddFailed() {
    message.error('Add to channel failed!');
  }

  handleAdd() {
    this.handleAddSuccess();
  }

  render() {
    const outerDivStyle = {
      padding: '24px',
    };
    const spanStyle = {
      marginRight: '10px',
    };
    const selectStyle = {
      width: 160,
      marginRight: '20px',
    };
    return (
      <div style={outerDivStyle}>
        <div>
          <span style={spanStyle}>Add peer to channel :</span>
          <Select
            defaultValue={peerData[0]}
            style={selectStyle}
            onSelect={this.handlePeerChange}
          >
            {peerData.map(peer => <Option key={peer} value={peer}>{peer}</Option>)}
          </Select>
          <Select
            defaultValue={channelData[0]}
            style={selectStyle}
            onSelect={this.handleChanelChange}
          >
            {channelData.map(channel => <Option key={channel} value={channel}>{channel}</Option>)}
          </Select>
          <Button type="primary" onClick={this.handleAdd}>Add</Button>
        </div>

      </div>
    );
  }
}
