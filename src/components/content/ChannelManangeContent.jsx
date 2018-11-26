import React from 'react';
import { Select, Button, message, Input } from 'antd';
import getFabricClientSingleton from '../../util/fabric';

const Option = Select.Option;

export default class ChannelManangeContent extends React.Component {
  constructor(props) {
    super(props);
    const obj = this;
    getFabricClientSingleton().then((fabricClient) => {
      fabricClient.queryChannels().then((result) => {
        console.log('the result: ');
        console.log(result);
        // 第一次进入页面时，持久化数组为空时，则把查询得到的peer所在的channel存储在持久化数组中完成初始化
        if (localStorage.getItem('channels') == null) {
          const channels = [];
          for (let i = 0; i < result.length; i++) {
            console.log('channel_id: ' + result[i].channel_id);
            channels.push(result[i].channel_id);
            localStorage.setItem('channels', JSON.stringify(channels));
          }
          console.log('channels: ' + channels);
        } else {
          console.log('channel stored: ');
          console.log(JSON.parse(localStorage.getItem('channels')));
        }
        // 第二次及以后进入页面时，则以持久化数组为准
        const channels = JSON.parse(localStorage.getItem('channels'));
        obj.setState({ channellist: channels });
      });
    });

    this.state = {
      channel: '',
      channelName: '',
      channelNameValue: '',
      channellist: [],
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleAddToChannelSuccess = this.handleAddToChannelSuccess.bind(this);
    this.handleAddtoChannelFailed = this.handleAddtoChannelFailed.bind(this);
    this.handleAddToChannel = this.handleAddToChannel.bind(this);
    this.handleCreateChannel = this.handleCreateChannel.bind(this);
    this.handleCreateChannelSuccess = this.handleCreateChannelSuccess.bind(this);
    this.handleCreateChannelFailed = this.handleCreateChannelFailed.bind(this);
    this.handleCreateChannelCallback = this.handleCreateChannelCallback.bind(this);
    this.handleAddToChannelCallback = this.handleAddToChannelCallback.bind(this);
  }

  onChangeChannel(event) {
    this.setState({ channelName: event.target.value });
    this.setState({ channelNameValue: event.target.value });
  }

  handleChannelChange(value) {
    console.log('channel choosed: ' + value);
    this.setState({ channel: value });
  }

  handleAddToChannelSuccess() {
    message.success('Add to channel successfully!');
  }

  handleAddtoChannelFailed() {
    message.error('Add to channel failed!');
  }
  handleCreateChannelSuccess() {
    message.success('Channel created successfully!');
  }
  handleCreateChannelFailed() {
    message.error('Channel created failed!');
  }

  handleAddToChannel() {
    getFabricClientSingleton().then((fabricClient) => {
      fabricClient.joinChannel(this.state.channel).then(this.handleAddToChannelCallback,
        this.handleAddToChannelCallback);
    });
  }

  handleAddToChannelCallback(result) {
    // 如果加入通道失败
    if (result.indexOf('fail') > -1) {
      this.handleAddtoChannelFailed();
    } else {
      // 如果加入通道成功
      this.handleAddToChannelSuccess();
    }
  }

  handleCreateChannel() {
    console.log('the to-create channel name: ' + this.state.channelName);
    getFabricClientSingleton().then((fabricClient) => {
      fabricClient.createChannel(this.state.channelName).then(this.handleCreateChannelCallback,
        this.handleCreateChannelCallback);
    });
  }

  handleCreateChannelCallback(result) {
    // 如果创建通道失败
    if (result.indexOf('fail') > -1) {
      this.handleCreateChannelFailed();
    } else {
      // 创建通道成功
      const channels = this.state.channellist;
      channels.push(this.state.channelName);
      this.setState({ channellist: channels });
      this.handleCreateChannelSuccess();
      // 持久化
      localStorage.setItem('channels', JSON.stringify(channels));
    }
    this.setState({ channelNameValue: '' });
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
          <Input placeholder="channel name" style={InputStyle} value={this.state.channelNameValue} onChange={this.onChangeChannel} />
          <Button type="primary" onClick={this.handleCreateChannel}>Submit</Button>
        </div>
        <div>
          <span style={spanStyle}>Add to channel :</span>
          <Select
            defaultValue="mychannel"
            style={selectStyle}
            onSelect={this.handleChannelChange}
          >
            {
              this.state.channellist.map(channel =>
                <Option key={channel} value={channel}>{channel}</Option>)
            }
          </Select>
          <Button type="primary" onClick={this.handleAddToChannel}>Submit</Button>
        </div>

      </div>
    );
  }
}
