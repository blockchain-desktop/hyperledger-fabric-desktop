import React, { Component } from 'react';
import { Button, Form, Input, Modal, Menu, Dropdown,Icon } from 'antd';
import moment from 'moment';
import getFabricClientSingleton from '../../util/fabric'

//弹出层窗口组件
const FormItem = Form.Item;
const CollectionCreateForm = Form.create()(
    class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
      this.nameValidator=this.nameValidator.bind(this);
      this.versionValidator=this.versionValidator.bind(this);
    }
    nameValidator(rule,value,callback){
      if(!/^[A-Za-z0-9]+$/.test(value)){
        callback("只支持英文和数字，不支持中文及其他字符！");
      }
      callback();
    }

    versionValidator(rule,value,callback){
      if(!/^\d+(.\d+)?$/.test(value)){
        callback("只支持数字和小数点！");
      }
      callback();
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
                  rules: [{ required: true, message: '请输入链码名称! ' },{validator:this.nameValidator}],
                })(
                  <Input />,
                            )}
              </FormItem>
              <FormItem label="版本">
                {getFieldDecorator('version', {
                  rules: [{ required: true, message: '请输入链码版本号! ' },{validator:this.versionValidator}],
                })(
                  <Input />,
                            )}
              </FormItem>
              <FormItem label="路径">
                  {getFieldDecorator('path', {
                      rules: [{ required: true, message: '请输入链码文件路径!' }],
                  })(
                  <Input placeholder="github.com/hyperledger/fabric-dev-network/chaincode/fabcar/go"/>,
                  )}
              </FormItem>
              <FormItem label="描述">
                {getFieldDecorator('description')(<Input type="textarea" />)}
              </FormItem>
            </Form>
          </Modal>
        );
      }
    },
);

//智能合约窗口子组件
class ContractDiv extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
       disable1: false,
       disable2: false,
       time:'',
       result:'已新建智能合约'
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleInstallChaincodeCallBack=this.handleInstallChaincodeCallBack.bind(this);
    this.handleInstantiateChaincodeCallBack=this.handleInstantiateChaincodeCallBack.bind(this);
  }

  handleInstallChaincodeCallBack(result){
     this.setState({result: result});
     this.setState({time: moment().format("YYYY-MM-DD HH:mm:ss")});
     this.setState({disable1: true});
  }
  handleInstantiateChaincodeCallBack(result){
     this.setState({result:result});
     this.setState({time: moment().format("YYYY-MM-DD HH:mm:ss")});
     this.setState({disable2: true});
  }
  handleMenuClick(e) {
    var fc=getFabricClientSingleton();
    if (e.key == 1) {
      fc.installCc(this.handleInstallChaincodeCallBack,
          this.props.citem.path,
          this.props.citem.name,
          this.props.citem.version)
    }
    if (e.key == 2) {
        fc.instantiateCc(this.handleInstantiateChaincodeCallBack,
            'mychannel',
            this.props.citem.name,
            this.props.citem.version,
            [""])
    }
    if (e.key == 3) {
      this.props.onDel();
      console.log("you have remove the smartbill.");
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
      border:'1px solid rgb(217, 217, 217)',
      borderRadius:'4px',
      float: 'left'
    };
    const contentStyle={
      padding:'10px'
    };
    const PStyle={
      display:'block',
      alignItems:'center',
      overflow:'hidden',
      margin:'10px',
      whiteSpace:'nowrap',
      textOverflow:'ellipsis',
      fontSize:'14px'
    };
    const nameSpanStyle={
        fontSize:'16px'
    }
    const versionSpanStyle={
      fontSize:'12px',
      marginLeft:'12px',
      padding:'0 5px',
      backgroundColor:'rgb(216, 216, 216)'
    }
    const timeSpanStyle={
      display:'block',
      marginTop:'5px',
      fontSize:'12px',
      color:'gray',
    }
    const DropdownStyle={
      display:'block',
      margin: '12px',
    }
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

//智能合约窗口父组件
class ListToDo extends React.Component {
  constructor(props) {
    super(props);

    this.handleDelete=this.handleDelete.bind(this);
  }

  handleDelete(){
    var index=this.props.ckey;
    this.props.todo.splice(index,1);
    this.props.onDelete(this.props.todo);
  }

  render() {
    return (
      <div>
        {
        this.props.todo.map((item,i) => {
           return <ContractDiv key={i} citem={item} ckey={i} onDel={this.handleDelete}/>
        })
        }
      </div>
    );
  }
}

//全局组件
export default class ChaincodeInstallContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      todolist: [],
    };

    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
    this.handleChange=this.handleChange.bind(this);
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
      var list=this.state.todolist;
      list.push(values);
      this.setState({todolist: list});

      console.log('Received values of forms: ', values);
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  saveFormRef(formRef) {
    this.formRef = formRef;
  }

  handleChange(newlist){
    this.setState({todolist: newlist});
  }

  render() {
    const mainDivStyle={
       minHeight:'600px',
       minWidth:'600px'
    }

    const plusDivStyle = {
      height: '200px',
      width: '240px',
      marginBottom: '20px',
      marginRight: '20px',
      display: 'block',
      alignItems: 'center',
      float:'left'
    };

    const buttonStyle = {
      margin: 'auto',
      display: 'block',
      height: '100%',
      width: '100%',
    };

    return (
      <div style={mainDivStyle}>
        <div style={plusDivStyle}>
          <Button icon="plus" style={buttonStyle} onClick={this.showModal}>添加合约</Button>
          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
        </div>
        <ListToDo todo={this.state.todolist} onDelete={this.handleChange}/>
      </div>
    );
  }
}

