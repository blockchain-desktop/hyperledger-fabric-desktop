// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Form, Input, Modal, Menu, Dropdown, Icon } from 'antd';
import moment from 'moment';
import getFabricClientSingleton from '../../util/fabric';
import { getChaincodeDBSingleton } from '../../util/createDB';

const db = getChaincodeDBSingleton();

const logger = require('electron-log');

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
    static channelValidator(rule, value, callback) {
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        callback('only letters and digitals！');
      }
      callback();
    }
    constructor(props) {
      super(props);
      this.state = {
        language: localStorage.getItem('language'),
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
                rules: [{ required: true, message: 'channel name can not be null!' }, { validator: CollectionCreateForm.channelValidator }],
              })(
                <Input placeholder="channel name" />,
              )}
            </FormItem>
            <FormItem label={this.state.language === 'cn' ? '路径' : 'Path'} style={formItemStyle}>
              {getFieldDecorator('path', {
                rules: [{ required: true, message: 'chaincode path can not be null!' }],
              })(
                <Input placeholder="chaincode path" />,
              )}
            </FormItem>
            <FormItem label={this.state.language === 'cn' ? '描述' : 'Description'} style={formItemStyle}>
              {getFieldDecorator('description')(<Input placeholder="function description" />)}
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
      time: this.props.citem.time,
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
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
    } else {
      // 安装链码成功
      this.setState({ icontype: 'check-circle', iconcolor: '#52c41a' });
      this.setState({ disable1: true });
      this.setState({ result: 'installed successfully' });
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
      this.setState({ signal: '1' });
      // 更新持久化数据库
      db.update({ name: this.props.citem.name,
        version: this.props.citem.version,
        channel: this.props.citem.channel },
      { $set: { disable1: true, result: 'installed successfully', time: this.state.time } },
      {}, () => {
      });
    }
  }
  // 对实例化链码进行操作
  handleInstantiateChaincodeCallBack(result) {
    if (result.indexOf('fail') > -1) {
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
      this.setState({ icontype: 'exclamation-circle', iconcolor: '#FF4500' });
      this.setState({ disable2: false });
      this.setState({ result: 'instantiation failed' });
    } else {
      // 实例化链码成功
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
      this.setState({ icontype: 'check-circle', iconcolor: '#52c41a' });
      this.setState({ disable2: true });
      this.setState({ result: 'instantiated successfully' });
      db.update({ name: this.props.citem.name,
        version: this.props.citem.version,
        channel: this.props.citem.channel },
      { $set: { disable1: true, disable2: true, result: 'instantiated successfully', time: this.state.time } },
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
        // 删除链码操作
        const contract = {
          name: this.props.citem.name,
          version: this.props.citem.version,
          channel: this.props.citem.channel,
          path: this.props.citem.path,
          description: this.props.citem.description,
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
            logger.info('remove the document failed! ');
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
      marginBottom: '20px',
      marginRight: '20px',
      display: 'block',
      alignItems: 'center',
      border: '1px solid rgb(217, 217, 217)',
      borderRadius: '4px',
      float: 'left',
    };
    const contentStyle = {
      padding: '15px',
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
    const timeSpanStyle = {
      display: 'block',
      marginTop: '5px',
      fontSize: '12px',
      color: 'gray',
    };
    const DropdownStyle = {
      display: 'block',
      margin: '12px',
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
              <span style={timeSpanStyle}>{this.state.time}</span>
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
              key={item.key}
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
    db.find({}, (err, docs) => {
      if (err) {
        logger.info('the operation of find documents failed!');
      }
      for (let i = 0; i < docs.length; i++) {
        arr.push(docs[i]);
      }
      arr.sort(ChaincodeInstallContent.sortkey);
      logger.info('the arr: ', arr);
      obj.setState({ todolist: arr });
    });
    this.state = {
      visible: false,
      todolist: arr,
      language: localStorage.getItem('language'),
    };
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
        channel: values.channel,
        path: values.path,
        description: values.description,
        key: moment().format('YYYYMMDDHHmmss'),
        disable1: false,
        disable2: false,
        result: 'added successfully',
        time: '',
      };

      // 新增智能合约对象加入todolist数组
      const list = this.state.todolist;
      list.push(li);
      this.setState({ todolist: list });
      logger.info('the contract list:', this.state.todolist);

      // 新增智能合约对象数据持久化
      db.insert(li, (error) => {
        if (error) {
          logger.info('insert into database failed');
        }
      });
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  saveFormRef(formRef) {
    this.formRef = formRef;
  }

  handleChange(newlist) {
    this.setState({ todolist: newlist });
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
      marginBottom: '20px',
      marginRight: '20px',
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
      </div>
    );
  }
}

