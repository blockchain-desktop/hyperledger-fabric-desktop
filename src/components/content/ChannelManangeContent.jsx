/* eslint-disable react/no-string-refs,react/no-find-dom-node */
import React from 'react';
import ReactDOM from 'react-dom';
import { Select, Button, message, Input, Icon } from 'antd';
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
      certDir: '',
      certlabel: '',
      yamllabel: '',
      yamlFile: '',
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
    this.orgCertDirImport = this.orgCertDirImport.bind(this);
    this.yamlFileImport = this.yamlFileImport.bind(this);
  }

  componentDidMount() {
    const input = ReactDOM.findDOMNode(this.refs.certDirSupport);
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.setAttribute('multiple', '');
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

  orgCertDirImport() {
    const selectedFile = document.getElementById('cerFiles').files[0];// 获取读取的File对象
    this.setState({ certDir: selectedFile.path });
    const cerArray = selectedFile.path.split('/');
    this.setState({ certlabel: cerArray[cerArray.length - 1] });
  }

  yamlFileImport() {
    const selectedFile = document.getElementById('yamlFile').files[0];// 获取读取的File对象
    this.setState({ yamlFile: selectedFile.path });
    const yamlArray = selectedFile.path.split('/');
    this.setState({ yamllabel: yamlArray[yamlArray.length - 1] });
  }

  render() {
    const outerDivStyle = {
      padding: '24px',
    };
    const spanStyle = {
      marginRight: '10px',
      display: 'inline-block',
    };
    const SpanStyle = {
      marginTop: '30px',
    };
    const fileStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1,
    };
    const labelStyle = {
      fontSize: '1.1em',
      border: '1px solid rgb(217, 217, 217)',
      borderRadius: '4px',
      display: 'block',
      width: '270px',
      height: '32px',
      verticalAlign: 'middle',
      textAlign: 'center',
      lineHeight: '30px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      marginLeft: '124px',
      marginTop: '-25px',
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
    const DivStyle = {
      marginBottom: '30px',
    };
    return (
      <div style={outerDivStyle}>
        <div style={DivStyle}>
          <span style={SpanStyle}>Org certificate : </span>
          <input type="file" id="cerFiles" name="cerFiles" style={fileStyle} onChange={this.orgCertDirImport} ref="certDirSupport" />
          <label htmlFor="cerFiles" style={labelStyle} ><Icon type="folder-open" theme="outlined" style={{ color: '#0083FA', paddingLeft: '7px', paddingRight: '7px' }} />{this.state.certlabel} </label>
        </div>
        <div style={DivStyle}>
          <span style={SpanStyle}>Configtx yaml : </span>
          <input type="file" id="yamlFile" name="yamlFile" style={fileStyle} onChange={this.yamlFileImport} />
          <label htmlFor="yamlFile" style={labelStyle} ><Icon type="copy" theme="outlined" style={{ color: '#0083FA', paddingLeft: '7px', paddingRight: '7px' }} />{this.state.yamllabel} </label>
        </div>
        <div style={DivStyle}>
          <span style={spanStyle}>Create a channel : </span>
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
/*
*  1.显示通道，包含通道成员等信息(可简化，目前暂未在SDK找到查找通道成员的方法)
*  2.创建通道，用户可以通过客户端来制定哪些组织可加入通道， 即可通过客户端生成用户自定义的yaml文件
*            (1)前端，用户添加组织，包括组织名称，MSPID， MSPDir，AnchorPeers，MSPDir即msp证书的目录
*           （2）后台，通过用户所输入的，生成yaml文件，并配置好证书，后面创建通道跟现有操作保持一致
*  3.更新通道，用户可以通过更新通道来新增成员，该成员在创建通道时未定义在yaml文件内
*
* */
