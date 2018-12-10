/* eslint-disable array-callback-return,max-len */
// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Button, Form, Input, Modal, Menu, Dropdown, Icon, Select, Tag, message } from 'antd';
import getFabricClientSingleton from '../../util/fabric';

const logger = require('electron-log');

const Option = Select.Option;
// 弹出层窗口组件
const FormItem = Form.Item;

const CollectionCreateForm = Form.create()(
  class extends React.Component {
    static nameValidator(rule, value, callback) {
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        callback('only letters and digital！');
      }
      callback();
    }
    static versionValidator(rule, value, callback) {
      if (!/^\d+(.\d+)?$/.test(value)) {
        callback('only digital and dot！');
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
        Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),
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
          title={this.state.Common.NEW_CONTRACT}
          okText={this.state.Common.CREATE}
          cancelText={this.state.Common.CANCEL}
          onCancel={onCancel}
          onOk={onCreate}
          centered
          width="480px"
        >
          <Form layout="vertical">
            <FormItem label={this.state.Common.NAME} style={formItemStyle}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: this.state.Common.WARN.chaincodeName },
                  { validator: CollectionCreateForm.nameValidator }],
              })(
                <Input placeholder={this.state.Common.CONTRACT_NAME + this.state.Common.NAME} />,
              )}
            </FormItem>
            <FormItem label={this.state.Common.VERSION} style={formItemStyle}>
              {getFieldDecorator('version', {
                rules: [{ required: true, message: this.state.Common.WARN.chaincodeVersion },
                  { validator: CollectionCreateForm.versionValidator }],
              })(
                <Input placeholder={this.state.Common.CONTRACT_NAME + this.state.Common.VERSION} />,
              )}
            </FormItem>
            <FormItem label={this.state.Common.CHANNEL_NAME} style={formItemStyle}>
              {getFieldDecorator('channel', {
                rules: [{ required: true, message: this.state.Common.WARN.channelName }],
              })(
                <Select
                  placeholder={this.state.Common.SELECT + this.state.Common.CHANNEL_NAME}
                >
                  {
                    this.state.channellist.map(channel =>
                      <Option key={channel} value={channel}>{channel}</Option>)
                  }
                </Select>,
              )}
            </FormItem>
            <FormItem label={this.state.Common.PATH} style={formItemStyle}>
              {getFieldDecorator('path', {
                rules: [{ required: true, message: this.state.Common.WARN.chaincodePath }],
              })(
                <Input placeholder={this.state.Common.CONTRACT_NAME + this.state.Common.PATH} />,
              )}
            </FormItem>
            {/* <FormItem label={this.state.Common.CHAINCODECONSTRUCTOR} style={formItemStyle}> */}
            {/* {getFieldDecorator('constructor', { */}
            {/* rules: [{ required: true,
            message: this.state.Common.WARN.constructorParameter }], */}
            {/* })( */}
            {/* <Input placeholder={this.state.Common.CHAINCODECONSTRUCTOR} />, */}
            {/* )} */}
            {/* </FormItem> */}
            {/* <FormItem label={this.state.Common.ENDORSEPOLICY} style={formItemStyle}> */}
            {/* {getFieldDecorator('policy', { */}
            {/* rules: [{ required: true, message: this.state.Common.WARN.endorsePolicy }], */}
            {/* })( */}
            {/* <Input placeholder={this.state.Common.ENDORSEPOLICY} />, */}
            {/* )} */}
            {/* </FormItem> */}
          </Form>
        </Modal>
      );
    }
  },
);

// 智能合约子组件层级下的实例化链码表单组件
const InstanitateCreateForm = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),
      };
    }
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title={this.state.Common.INTANITATE}
          okText={this.state.Common.CREATE}
          cancelText={this.state.Common.CANCEL}
          onCancel={onCancel}
          onOk={onCreate}
          centered
          width="480px"
        >
          <Form layout="vertical">
            <FormItem label={this.state.Common.CHAINCODECONSTRUCTOR}>
              {getFieldDecorator('construct', {
                rules: [{ required: true,
                  message: this.state.Common.WARN.constructorParameter }],
              })(
                <Input placeholder={this.state.Common.CHAINCODECONSTRUCTOR} />,
              )}
            </FormItem>
            <FormItem label={this.state.Common.ENDORSEPOLICY} >
              {getFieldDecorator('policy', {
                rules: [{ required: true, message: this.state.Common.WARN.endorsePolicy }],
              })(
                <Input placeholder={this.state.Common.ENDORSEPOLICY} />,
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
      visible: false,
      disable1: this.props.citem.disable1,
      disable2: this.props.citem.disable2,
      result: this.props.citem.result,
      icontype: 'check-circle',
      iconcolor: '#52c41a',
      Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleInstallChaincodeCallBack = this.handleInstallChaincodeCallBack.bind(this);
    this.handleInstantiateChaincodeCallBack = this.handleInstantiateChaincodeCallBack.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
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
      console.log('Received values of instanitateform: ', values);
      // 实例化链码操作
      this.setState({ icontype: 'clock-circle', iconcolor: '#1E90FF' });
      this.setState({ result: 'instantiate chaincode...' });
      getFabricClientSingleton().then((fabricClient) => {
        fabricClient.instantiateCc(this.props.citem.channel,
          this.props.citem.name,
          this.props.citem.version,
          values.construct,
          values.policy)
          .then(this.handleInstantiateChaincodeCallBack, this.handleInstantiateChaincodeCallBack);
      });
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  saveFormRef(formRef) {
    this.formRef = formRef;
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
      // 实例化成功后，更新todolistcopy
      // const li = {
      //   name: this.props.citem.name,
      //   version: this.props.citem.version,
      //   channel: this.props.citem.channel,
      //   path: this.props.citem.path,
      //   disable1: true,
      //   disable2: true,
      //   result: 'instantiated successfully',
      // };
      const listcopy = this.props.ctodocopy;
      // listcopy.push(li);
      // this.props.conAddCopy(listcopy);
      logger.info('listcopy: ');
      logger.info(listcopy);
      logger.info('todolist: ');
      logger.info(this.props.ctodo);
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
        this.showModal();
      }
      if (e.key === '3') {
        // 删除链码操作,实质上Fabric1.1版本中并未提供删除链码的任何操作，
        // 这里只是提供在安装链码未成功的场景下给用户删除的操作
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
      }
    });
  }

  render() {
    const ConTractDivStyle = {
      height: '200px',
      width: '230px',
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
      display: 'inline-block',
      width: '40px',
      textAlign: 'center',
      borderRadius: '4px',
      fontSize: '12px',
      marginLeft: '12px',
      padding: '0 5px',
      backgroundColor: 'rgb(216, 216, 216)',
    };
    const channeltagStyle = {
      marginLeft: '12px',
      color: '#1E90FF',
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
            <Tag style={channeltagStyle} >#{this.props.citem.channel}</Tag>
            <p style={PStyle}>
              <span><Icon type={this.state.icontype} theme="outlined" style={{ color: this.state.iconcolor }} />&nbsp;</span>
              <span>{this.state.result}</span>
            </p>
          </div>
          <div style={DropdownStyle}>
            <Dropdown.Button overlay={menu} type="primary">{this.state.Common.OPERATIONS}</Dropdown.Button>
            <InstanitateCreateForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              onCreate={this.handleCreate}
            />
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
              ctodocopy={this.props.todocopy}
              conAddCopy={this.props.onAddCopy}
            />))
        }
      </div>
    );
  }
}

// 全局组件
export default class ChaincodeInstallContent extends React.Component {
  constructor(props) {
    super(props);
    const arr = [];
    const obj = this;
    // 对于某个peer上的链码来说，name+version作为标识链码的唯一主键，从网络中查询时，只查询实例化过的链码
    // 出于这样的考虑：不鼓励用户安装链码后不使用链码(即实例化链码)，所以在用户添加新的链码时，用户即需指定一个channel,
    // 但是出于用户安装链码忘记实例化以及在多个通道实例化的考虑，对于这样的链码，当用户进入链码安装界面查看链码的数据时，不进行展示，
    // 但是会在用户重新添加的相同的链码时只暴露实例化操作
    getFabricClientSingleton().then((fabricClient) => {
      // 先查询通道，不论数据库是否为空，都需要查询通道，获得通道数据
      fabricClient.queryChannels().then((result) => {
        // 对于channel来说，查询的数据中并没有'allchannels'此项，加上此项仅是为了界面展示需要
        const channellist = ['allchannels'];
        for (let i = 0; i < result.length; i++) {
          channellist.push(result[i].channel_id);
        }
        // console.log('channel_list_length: ' + channellist.length);
        // 每次进入页面初始化时，都需要从网络中查询数据
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
                    disable1: true,
                    disable2: true,
                    result: 'instantiated successfully',
                  };
                  arr.push(doc);
                }
                // todolistcopy为todolist的副本，作为通道切换时的原数据使用
                obj.setState({ todolist: arr });
                obj.setState({ todolistcopy: arr });
                // console.log('初始化的todolist: ');
                // console.log(this.state.todolist);
                // console.log('初始化的todolistcopy: ');
                // console.log(this.state.todolistcopy);
              }
            });
        }
        obj.setState({ channelList: channellist });
      });
    });

    this.state = {
      visible: false,
      todolist: [],
      todolistcopy: [],
      Common: localStorage.getItem('language') === 'cn' ? require('../../common/common_cn') : require('../../common/common'),
      channelList: [],
    };
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeCopy = this.handleChangeCopy.bind(this);
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
        disable1: false,
        disable2: false,
        result: 'added successfully',
      };
      // flag用来标志链码，flag=0标志链码只被添加，flag=1标志链码被安装，flag=2标志链码被实例化
      let flag = 0;
      // 对于已经安装过的链码分为只安装忘记实例化的链码和已在某个通道实例化但是想在其他通道实例化的链码
      const listcopy = this.state.todolistcopy;
      for (let k = 0; k < listcopy.length; k++) {
        // 错误处理: 如果在todolistcopy中查询到已安装并且实例化相同的链码，则提示错误信息
        if (listcopy[k].name === li.name && listcopy[k].version === li.version
            && listcopy[k].channel === li.channel) {
          message.error(this.state.Common.ERROR.instatiateTwice);
          break;
        }
        // 在todolistcopy中查询该链码是否被实例化，对于已在某个通道实例化但是想在其他通道实例化的链码则重新插入一条记录
        if (listcopy[k].name === li.name && listcopy[k].version === li.version
            && listcopy[k].channel !== li.channel) {
          li.disable1 = true;
          li.result = 'installed successfully';
          flag = 2;
          const list = this.state.todolist;
          list.push(li);
          this.setState({ todolist: list });
          // console.log('链码已被实例化后的todolist: ');
          // console.log(this.state.todolist);
          break;
        }
      }
      // 对于只被安装但忘记实例化的链码，则在原链码上进行操作
      getFabricClientSingleton().then((fabricClient) => {
        fabricClient.queryInstalledChaincodes().then((result) => {
          if (result != null || result.length !== 0) {
            // 从所有查询到的已安装的链码中进行比对，查看该链码是否被安装过
            for (let i = 0; i < result.length; i++) {
              // console.log('result: ');
            //  console.log(result[i]);
              // 查询此链码是否为已安装,未被实例化
              if (li.name === result[i].name && li.version === result[i].version && flag !== 2) {
                flag = 1;
                // 如果该链码已安装未被实例化，则查询界面中是否已经渲染
                let isvisible = 0;
                // 如果界面中有渲染，则不进行任何动作
                const elements = this.state.todolist;
                // console.log('elements length:' + elements.length);
                for (let j = 0; j < elements.length; j++) {
                  if (li.name === elements[j].name && li.version === elements[j].version
                      && li.channel === elements[j].channel) {
                    isvisible = 1;
                    break;
                  }
                }
                // console.log('isvisible: ' + isvisible);
                // 如果界面中没渲染,则渲染出来
                if (isvisible === 0) {
                  li.disable1 = true;
                  li.result = 'installed successfully';
                  elements.push(li);
                  this.setState({ todolist: elements });
                  // console.log('链码已经安装但是忘记被实例化的todolist: ');
                  // console.log(this.state.todolist);
                }
                break;
              }
            }
          }
          // 如果链码从未安装过，未曾安装过的链码则直接插入todolist对象中
          if (flag === 0) {
            const todo = this.state.todolist;
            todo.push(li);
            this.setState({ todolist: todo });
          }
        });
        //  console.log('contract list: ');
        //  console.log(this.state.todolist);
        form.resetFields();
        this.setState({ visible: false });
      });
    });
  }

  saveFormRef(formRef) {
    this.formRef = formRef;
  }

  handleChange(newlist) {
    this.setState({ todolist: newlist });
  }

  handleChangeCopy(newlist) {
    this.setState({ todolistcopy: newlist });
  }

  handleSelect(value) {
    logger.info('choosen channel: ' + value);
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
      width: '230px',
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
      right: '60px',
      top: '60px',
    };
    return (
      <div style={outerDivStyle}>
        <div style={plusDivStyle}>
          <Button icon="plus" style={buttonStyle} onClick={this.showModal}> {this.state.Common.ADD_CONTRACT}</Button>
          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
        </div>
        <ListToDo
          todo={this.state.todolist}
          onDelete={this.handleChange}
          todocopy={this.state.todolistcopy}
          onAddCopy={this.handleChangeCopy}
        />
        <div style={selectStyle} >
          <Select
            placeholder="all channels"
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

