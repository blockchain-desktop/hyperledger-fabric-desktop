import React from 'react';
import { Select, Button, message, Input } from 'antd';

const Option = Select.Option;

export default class ChannelManangeContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: '',
      channelName: '',
      channellist: ['channel1', 'channel2'],
    };
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleAddSuccess = this.handleAddSuccess.bind(this);
    this.handleAddFailed = this.handleAddFailed.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.addChannel = this.addChannel.bind(this);
    this.onChangeChannel = this.onChangeChannel.bind(this);
  }

  onChangeChannel(event) {
    this.setState({ channelName: event.target.value });
  }

  handleChannelChange(value) {
    console.log('channel choosed: ' + value);
    this.setState({ channel: value });
  }

  handleAddSuccess() {
    message.success('Added successfully!');
  }

  handleAddFailed() {
    message.error('Add to channel failed!');
  }

  handleAdd() {
    // 添加peer到channel成功
    this.handleAddSuccess();
    // 添加peer到channel失败
    // this.handleAddFailed();
  }

  addChannel() {
    console.log('the to-add channel name' + this.state.channelName);
    const channels = this.state.channellist;
    channels.push(this.state.channelName);
    this.setState({ channellist: channels });
    console.log('channel array after added a channel: ');
    console.log(this.state.channellist);
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
      width: 180,
      marginRight: '20px',
      marginLeft: '10px',
    };
    const InputStyle = {
      marginRight: '20px',
      width: 180,
    };
    const divFirstStyle = {
      marginBottom: '30px',
    };
    return (
      <div style={outerDivStyle}>
        <div style={divFirstStyle}>
          <span style={spanStyle}>Create a channel: </span>
          <Input placeholder="channel name" style={InputStyle} onChange={this.onChangeChannel} />
          <Button type="primary" onClick={this.addChannel}>Submit</Button>
        </div>
        <div>
          <span style={spanStyle}>Add to channel :</span>
          <Select
            defaultValue={this.state.channellist[0]}
            style={selectStyle}
            onSelect={this.handleChanelChange}
          >
            {
              this.state.channellist.map(channel =>
                <Option key={channel} value={channel}>{channel}</Option>)
            }
          </Select>
          <Button type="primary" onClick={this.handleAdd}>Add</Button>
        </div>

      </div>
    );
  }
}
