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
        callback('只支持英文和数字，不支持中文及其他字符！');
      }
      callback();
    }
    static versionValidator(rule, value, callback) {
      if (!/^\d+(.\d+)?$/.test(value)) {
        callback('只支持数字和小数点！');
      }
      callback();
    }
    static channelValidator(rule, value, callback) {
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        callback('只支持英文和数字，不支持中文及其他字符！');
      }
      callback();
    }
    constructor(props) {
      super(props);
      this.state = {

      };
    }
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="新建智能合约"
          okText="新建"
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入链码名称! ' }, { validator: CollectionCreateForm.nameValidator }],
              })(
                <Input placeholder="链码名称" />,
              )}
            </FormItem>
            <FormItem label="版本">
              {getFieldDecorator('version', {
                rules: [{ required: true, message: '请输入链码版本号! ' }, { validator: CollectionCreateForm.versionValidator }],
              })(
                <Input placeholder="链码版本" />,
              )}
            </FormItem>
            <FormItem label="通道">
              {getFieldDecorator('channel', {
                rules: [{ required: true, message: '请输入通道名称! ' }, { validator: CollectionCreateForm.channelValidator }],
              })(
                <Input placeholder="通道名称" />,
              )}
            </FormItem>
            <FormItem label="路径">
              {getFieldDecorator('path', {
                rules: [{ required: true, message: '请输入链码文件路径!' }],
              })(
                <Input placeholder="文件路径" />,
              )}
            </FormItem>
            <FormItem label="描述">
              {getFieldDecorator('description')(<Input placeholder="功能描述" type="textarea" />)}
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
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleInstallChaincodeCallBack = this.handleInstallChaincodeCallBack.bind(this);
    this.handleInstantiateChaincodeCallBack = this.handleInstantiateChaincodeCallBack.bind(this);
  }
  // 对安装链码进行操作
  handleInstallChaincodeCallBack(result) {
    if (result.indexOf('失败') > -1) {
      this.setState({ icontype: 'exclamation-circle', iconcolor: '#FF4500' });
      this.setState({ disable1: false });
      this.setState({ result });
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
    } else {
      // 安装链码成功
      this.setState({ icontype: 'check-circle', iconcolor: '#52c41a' });
      this.setState({ disable1: true });
      this.setState({ result });
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
      this.setState({ signal: '1' });
      // 更新持久化数据库
      db.update({ name: this.props.citem.name,
        version: this.props.citem.version,
        channel: this.props.citem.channel },
      { $set: { disable1: true, result: '安装链码成功', time: this.state.time } },
      {}, () => {
      });
    }
  }
  // 对实例化链码进行操作
  handleInstantiateChaincodeCallBack(result) {
    if (result.indexOf('失败') > -1) {
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
      this.setState({ icontype: 'exclamation-circle', iconcolor: '#FF4500' });
      this.setState({ disable2: false });
      this.setState({ result });
    } else {
      // 实例化链码成功
      this.setState({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
      this.setState({ icontype: 'check-circle', iconcolor: '#52c41a' });
      this.setState({ disable2: true });
      this.setState({ result });
      db.update({ name: this.props.citem.name,
        version: this.props.citem.version,
        channel: this.props.citem.channel },
      { $set: { disable1: true, disable2: true, result: '实例化链码成功', time: this.state.time } },
      {}, () => {
      });
    }
  }


  handleMenuClick(e) {
    const fc = getFabricClientSingleton();
    if (e.key === '1') {
      // 安装链码操作
      this.setState({ icontype: 'clock-circle', iconcolor: '#1E90FF' });
      this.setState({ result: '正在安装智能合约...' });
      fc.installCc(this.handleInstallChaincodeCallBack,
        this.props.citem.path,
        this.props.citem.name,
        this.props.citem.version);
    }
    if (e.key === '2') {
      // 实例化链码操作
      this.setState({ icontype: 'clock-circle', iconcolor: '#1E90FF' });
      this.setState({ result: '正在部署智能合约...' });
      fc.instantiateCc(this.handleInstantiateChaincodeCallBack,
        this.props.citem.channel,
        this.props.citem.name,
        this.props.citem.version,
        ['']);
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
          logger.info('the opertion of remove document failed! ');
        } else {
          logger.info('you have remove the smartbill!');
        }
      });
    }
  }

  render() {
    const ConTractDivStyle = {
      height: '200px',
      width: '240px',
      marginBottom: '20px',
      marginRight: '10px',
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
        <Menu.Item key="1" disabled={this.state.disable1}>安装</Menu.Item>
        <Menu.Item key="2" disabled={this.state.disable2}>部署</Menu.Item>
        <Menu.Item key="3" >删除</Menu.Item>
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
              {this.props.citem.description}
            </p>
            <p style={PStyle}>
              <span><Icon type={this.state.icontype} theme="outlined" style={{ color: this.state.iconcolor }} />&nbsp;</span>
              <span>{this.state.result}</span>
              <span style={timeSpanStyle}>{this.state.time}</span>
            </p>
          </div>
          <div style={DropdownStyle}>
            <Dropdown.Button overlay={menu} type="primary">链码操作</Dropdown.Button>
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
        discription: values.description,
        key: moment().format('YYYYMMDDHHmmss'),
        disable1: false,
        disable2: false,
        result: '已新建智能合约',
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
          logger.info('The operation of insert into database failed');
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
    const plusDivStyle = {
      height: '200px',
      width: '240px',
      marginBottom: '20px',
      marginRight: '10px',
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
      <div style={{ minHeight: '900px' }}>
        <div style={plusDivStyle}>
          <Button icon="plus" style={buttonStyle} onClick={this.showModal}>添加合约</Button>
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

