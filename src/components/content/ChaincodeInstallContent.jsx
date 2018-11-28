/* eslint-disable array-callback-return */
// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Form, Input, Modal, Menu, Dropdown, Icon, Select } from 'antd';
import moment from 'moment';
import getFabricClientSingleton from '../../util/fabric';
import { getChaincodeDBSingleton } from '../../util/createDB';

const db = getChaincodeDBSingleton();

const logger = require('electron-log');

const Option = Select.Option;
// 弹出层窗口组件
const FormItem = Form.Item;

const CollectionCreateForm = Form.create()(
  class extends React.Component {
    static nameValidator(rule, value, callback) {
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        callback('only letters and digitals！');
      }
      callback();
    }
    static versionValidator(rule, value, callback) {
      if (!/^\d+(.\d+)?$/.test(value)) {
        callback('only digitals and dot！');
      }
      callback();
    }
    constructor(props) {
      super(props);
      const obj = this;
      getFabricClientSingleton().then((fabricClient) => {
        fabricClient.queryChannels().then((result) => {
          const channels = [];
          for (let i = 0; i < result.length; i++) {
          // console.log('channel_id: ' + result[i].channel_id);
            channels.push(result[i].channel_id);
          }
          obj.setState({ channellist: channels });
        });
      });
      this.state = {
        language: localStorage.getItem('language'),
        channellist: [],
      };
    }
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      const formItemStyle = {
        margin: '5px',
      };
      return (
        <Modal
          visible={visible}
          title={this.state.language === 'cn' ? '添加合约' : 'New Contract'}
          okText={this.state.language === 'cn' ? '确认' : 'create'}
          cancelText={this.state.language === 'cn' ? '取消' : 'cancel'}
          onCancel={onCancel}
          onOk={onCreate}
          centered
          width="480px"
        >
          <Form layout="vertical">
            <FormItem label={this.state.language === 'cn' ? '名称' : 'Name'} style={formItemStyle}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'chaincode name can not be null!' }, { validator: CollectionCreateForm.nameValidator }],
              })(
                <Input placeholder="chaincode name" />,
              )}
            </FormItem>
            <FormItem label={this.state.language === 'cn' ? '版本' : 'Version'} style={formItemStyle}>
              {getFieldDecorator('version', {
                rules: [{ required: true, message: 'chaincode version can not be null!' }, { validator: CollectionCreateForm.versionValidator }],
              })(
                <Input placeholder="chaincode version" />,
              )}
            </FormItem>
            <FormItem label={this.state.language === 'cn' ? '通道' : 'Channel'} style={formItemStyle}>
              {getFieldDecorator('channel', {
                rules: [{ required: true, message: 'channel name can not be null!' }],
              })(
                <Select
                  placeholder="select a channel"
                >
                  {
                    this.state.channellist.map(channel =>
                      <Option key={channel} value={channel}>{channel}</Option>)
                  }
                </Select>,
              )}
            </FormItem>
            <FormItem label={this.state.language === 'cn' ? '路径' : 'Path'} style={formItemStyle}>
              {getFieldDecorator('path', {
                rules: [{ required: true, message: 'chaincode path can not be null!' }],
              })(
                <Input placeholder="chaincode path" />,
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  },
);

// 智能合约窗口子组件
class ContractDiv extends React.Component {
  static findArray(array, name, version, channel) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === name && array[i].version === version && array[i].channel === channel) {
        return i;
      }
    }
    return -1;
  }

  constructor(props) {
    super(props);
    this.state = {
      disable1: this.props.citem.disable1,
      disable2: this.props.citem.disable2,
      result: this.props.citem.result,
      icontype: 'check-circle',
      iconcolor: '#52c41a',
      language: localStorage.getItem('language'),
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleInstallChaincodeCallBack = this.handleInstallChaincodeCallBack.bind(this);
    this.handleInstantiateChaincodeCallBack = this.handleInstantiateChaincodeCallBack.bind(this);
  }
  // 对安装链码进行操作
  handleInstallChaincodeCallBack(result) {
    if (result.indexOf('fail') > -1) {
      this.setState({ icontype: 'exclamation-circle', iconcolor: '#FF4500' });
      this.setState({ disable1: false });
      this.setState({ result: 'installation failed' });
    } else {
      // 安装链码成功
      this.setState({ icontype: 'check-circle', iconcolor: '#52c41a' });
      this.setState({ disable1: true });
      this.setState({ result: 'installed successfully' });
      this.setState({ signal: '1' });
      // 更新持久化数据库
      db.update({ name: this.props.citem.name,
        version: this.props.citem.version,
        channel: this.props.citem.channel,
      },
      { $set: { disable1: true, result: 'installed successfully' } },
      {}, () => {
      });
    }
  }
  // 对实例化链码进行操作
  handleInstantiateChaincodeCallBack(result) {
    if (result.indexOf('fail') > -1) {
      this.setState({ icontype: 'exclamation-circle', iconcolor: '#FF4500' });
      this.setState({ disable2: false });
      this.setState({ result: 'instantiation failed' });
    } else {
      // 实例化链码成功
      this.setState({ icontype: 'check-circle', iconcolor: '#52c41a' });
      this.setState({ disable2: true });
      this.setState({ result: 'instantiated successfully' });
      // 更新持久化数据库
      db.update({ name: this.props.citem.name,
        version: this.props.citem.version,
        channel: this.props.citem.channel,
      },
      { $set: { disable1: true, disable2: true, result: 'instantiated successfully' } },
      {}, () => {
      });
    }
  }


  handleMenuClick(e) {
    getFabricClientSingleton().then((fabricClient) => {
      if (e.key === '1') {
        // 安装链码操作
        this.setState({ icontype: 'clock-circle', iconcolor: '#1E90FF' });
        this.setState({ result: 'install chaincode...' });
        fabricClient.installCc(this.props.citem.path,
          this.props.citem.name,
          this.props.citem.version)
          .then(this.handleInstallChaincodeCallBack, this.handleInstallChaincodeCallBack);
      }
      if (e.key === '2') {
        // 实例化链码操作
        this.setState({ icontype: 'clock-circle', iconcolor: '#1E90FF' });
        this.setState({ result: 'instantiate chaincode...' });
        fabricClient.instantiateCc(this.props.citem.channel,
          this.props.citem.name,
          this.props.citem.version,
          [''])
          .then(this.handleInstantiateChaincodeCallBack, this.handleInstantiateChaincodeCallBack);
      }
      if (e.key === '3') {
        // 删除链码操作,实质上Fabric1.1版本中并未提供删除链码的任何操作，这里只是提供在安装链码未成功的场景下给用户删除的操作
        const contract = {
          name: this.props.citem.name,
          version: this.props.citem.version,
          channel: this.props.citem.channel,
          path: this.props.citem.path,
        };
        // 从todolist对象集中删除链码对象
        const index = ContractDiv.findArray(this.props.ctodo,
          contract.name,
          contract.version,
          contract.channel);
        this.props.ctodo.splice(index, 1);
        this.props.cdelete(this.props.ctodo);
        // 删除持久化数据库中的记录
        db.remove({ name: contract.name,
          version: contract.version,
          channel: contract.channel }, {}, (err) => {
          if (err) {
            logger.info('remove the contract failed! ');
          } else {
            logger.info('you have remove the contract!');
          }
        });
      }
    });
  }

  render() {
    const ConTractDivStyle = {
      height: '200px',
      width: '240px',
      marginBottom: '15px',
      marginRight: '15px',
      display: 'block',
      alignItems: 'center',
      border: '1px solid rgb(217, 217, 217)',
      borderRadius: '4px',
      float: 'left',
    };
    const contentStyle = {
      padding: '20px',
    };
    const PStyle = {
      display: 'block',
      alignItems: 'center',
      overflow: 'hidden',
      margin: '10px',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: '14px',
    };
    const nameSpanStyle = {
      fontSize: '16px',
    };
    const versionSpanStyle = {
      fontSize: '12px',
      marginLeft: '12px',
      padding: '0 5px',
      backgroundColor: 'rgb(216, 216, 216)',
    };
    const DropdownStyle = {
      display: 'block',
      margin: '16px',
    };
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1" disabled={this.state.disable1}>install</Menu.Item>
        <Menu.Item key="2" disabled={this.state.disable2}>instantiate</Menu.Item>
        <Menu.Item key="3" >delete</Menu.Item>
      </Menu>
    );
    return (
      <div style={ConTractDivStyle}>
        <div style={contentStyle}>
          <div>
            <p style={PStyle}>
              <span style={nameSpanStyle}>{this.props.citem.name}</span>
              <span style={versionSpanStyle}>{this.props.citem.version}</span>
            </p>
            <p style={PStyle}>
              <span>{this.props.citem.description}</span>
            </p>
            <p style={PStyle}>
              <span><Icon type={this.state.icontype} theme="outlined" style={{ color: this.state.iconcolor }} />&nbsp;</span>
              <span>{this.state.result}</span>
            </p>
          </div>
          <div style={DropdownStyle}>
            <Dropdown.Button overlay={menu} type="primary">{this.state.language === 'cn' ? '操作' : 'operations'}</Dropdown.Button>
          </div>
        </div>
      </div>
    );
  }
}

// 智能合约窗口父组件
class ListToDo extends React.Component {
  render() {
    return (
      <div>
        {
          this.props.todo.map(item =>
            (<ContractDiv
              key={item.name + item.version + item.channel}
              citem={item}
              ctodo={this.props.todo}
              cdelete={this.props.onDelete}
            />))
        }
      </div>
    );
  }
}

// 全局组件
export default class ChaincodeInstallContent extends React.Component {
  static sortkey(a, b) {
    return parseInt(a.key, 10) - parseInt(b.key, 10);
  }
  constructor(props) {
    super(props);
    const arr = [];
    const obj = this;
    getFabricClientSingleton().then((fabricClient) => {
      // 先查询通道，不论数据库是否为空，都需要查询通道，获得通道数据
      fabricClient.queryChannels().then((result) => {
        // 对于channel来说，查询的数据中并没有'allchannels'此项，加上此项仅是为了界面展示需要
        const channellist = ['allchannels'];
        for (let i = 0; i < result.length; i++) {
          channellist.push(result[i].channel_id);
        }
        // console.log('channel_list_length: ' + channellist.length);
        // 查询数据库,判断数据库是否为空
        db.find({}, (err, docs) => {
          // 如果数据库为空，则从网络中查询链码情况并记录在数据库中
          if (docs.length === 0 || docs == null) {
            // 对于单个peer上的链码来说，name+version作为标识链码的唯一主键，从网络中查询时，只查询实例化过的链码
            for (let i = 1; i < channellist.length; i++) {
              fabricClient.queryInstantiatedChaincodes(channellist[i]).then(
                (chaincodes) => {
                  if (chaincodes != null || chaincodes.length !== 0) {
                    for (let k = 0; k < chaincodes.length; k++) {
                      const doc = {
                        name: chaincodes[k].name,
                        version: chaincodes[k].version,
                        path: chaincodes[k].path,
                        channel: channellist[i],
                        key: moment().format('YYYYMMDDHHmmss'),
                        disable1: true,
                        disable2: true,
                        result: 'instantiated successfully',
                      };
                      db.insert(doc, (error) => {
                        if (error) {
                          logger.info('insert into database failed');
                        }
                      });
                    }
                  }
                });
            }
            // 对于对于只安装未曾实例化的链码和已在某个通道实例化但是想在其他通道实例化的链码，不显示在查询得到的结果中，
            // 需要重新create contract,但是不会允许再次安装，只暴露实例化操作
          }
        });
        obj.setState({ channelList: channellist });
      });
    });
    // 如果数据库不为空，则从数据库中查询链码情况
    setTimeout(() => {
      db.find({}, (err, doc) => {
        //  console.log('doc length: ' + doc.length);
        for (let i = 0; i < doc.length; i++) {
          arr.push(doc[i]);
        }
        // console.log(arr);
        arr.sort(ChaincodeInstallContent.sortkey);
        // todolistcopy为todolist的副本，作为通道切换时回到原数据使用
        obj.setState({ todolist: arr });
        obj.setState({ todolistcopy: arr });
      });
    }, 400);

    this.state = {
      visible: false,
      todolist: [],
      todolistcopy: [],
      language: localStorage.getItem('language'),
      channelList: [],
    };

    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  showModal() {
    this.setState({ visible: true });
  }

  handleCancel() {
    this.setState({ visible: false });
  }

  handleCreate() {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const li = {
        name: values.name,
        version: values.version,
        path: values.path,
        channel: values.channel,
        key: moment().format('YYYYMMDDHHmmss'),
        disable1: false,
        disable2: false,
        result: 'added successfully',
      };
      // 对于对于只安装未曾实例化的链码和已在某个通道实例化但是想在其他通道实例化的链码，不显示在初始化时查询得到的结果中，
      // 对于这样已经安装过的链码，再进行二次操作时，需要重新create contract,但是不允许安装，只允许实例化
      getFabricClientSingleton().then((fabricClient) => {
        fabricClient.queryInstalledChaincodes().then((result) => {
          if (result != null || result.length !== 0) {
            for (let i = 0; i < result.length; i++) {
              if (li.name === result[i].name && li.version === result[i].version) {
                li.disable1 = true;
                li.result = 'installed successfully';
              }
            }
          }
          // 新增智能合约对象加入todolist数组
          const list = this.state.todolist;
          list.push(li);
          this.setState({ todolist: list });
          // logger.info('the contract list:', this.state.todolist);
          // 新增智能合约对象插入数据库
          db.insert(li, (error) => {
            if (error) {
              logger.info('contract inserting into database failed');
            }
          });
          form.resetFields();
          this.setState({ visible: false });
        });
      });
    });
  }

  saveFormRef(formRef) {
    this.formRef = formRef;
  }

  handleChange(newlist) {
    this.setState({ todolist: newlist });
  }

  handleSelect(value) {
    console.log('choosen channel: ' + value);
    if (value === 'allchannels') {
      this.setState({ todolist: this.state.todolistcopy });
    } else {
      const contractlist = this.state.todolistcopy;
      // eslint-disable-next-line consistent-return
      const newtodolist = contractlist.filter((item) => {
        if (item.channel === value) {
          return item;
        }
      });
      this.setState({ todolist: newtodolist });
    }
  }
  render() {
    const outerDivStyle = {
      padding: '20px',
      height: '100%',
      overflow: 'scroll',
    };
    const plusDivStyle = {
      height: '200px',
      width: '240px',
      marginBottom: '15px',
      marginRight: '15px',
      display: 'block',
      alignItems: 'center',
      float: 'left',
    };
    const buttonStyle = {
      margin: 'auto',
      display: 'block',
      height: '100%',
      width: '100%',
    };
    const selectStyle = {
      display: 'block',
      position: 'absolute',
      left: '640px',
      top: '60px',
    };
    return (
      <div style={outerDivStyle}>
        <div style={plusDivStyle}>
          <Button icon="plus" style={buttonStyle} onClick={this.showModal}> {this.state.language === 'cn' ? '添加合约' : ' Add contract'}</Button>
          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
        </div>
        <ListToDo todo={this.state.todolist} onDelete={this.handleChange} />
        <div style={selectStyle} >
          <Select
            defaultValue="allchannels"
            style={{ width: 120 }}
            onSelect={this.handleSelect}
          >
            {
              this.state.channelList.map(channel =>
                <Option key={channel} value={channel}>{channel}</Option>)
            }
          </Select>
        </div>
      </div>
    );
  }
}

