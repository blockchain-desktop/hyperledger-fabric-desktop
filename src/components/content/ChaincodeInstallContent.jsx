import React from 'react';
import {Button, Form, Input, Modal, Menu,Dropdown} from 'antd';


const FormItem = Form.Item;

const CollectionCreateForm = Form.create()(
    class extends React.Component {
        render() {
            const {visible, onCancel, onCreate, form} =this.props;
            const {getFieldDecorator} = form;
            return (
                <Modal
                    visible={visible}
                    title="新建智能合约"
                    okText="Create"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem label="名称">
                            {getFieldDecorator('name', {
                                rules: [{required: true, message: 'Please input the title of collection!'}],
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem label="版本">
                            {getFieldDecorator('version', {
                                rules: [{required: true, message: 'Please input the title of collection!'}],
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem label="描述">
                            {getFieldDecorator('description')(<Input type="textarea"/>)}
                        </FormItem>
                    </Form>
                </Modal>
            );
        }
    }
);


export default class ChaincodeInstallContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        };

        this.showModal = this.showModal.bind(this);
        this.handleCancel=this.handleCancel.bind(this);
        this.handleCreate=this.handleCreate.bind(this);
        this.saveFormRef=this.saveFormRef.bind(this);
    }

    showModal(){
        this.setState({ visible: true });
    }

    handleCancel(){
        this.setState({ visible: false });
    }

    handleCreate(){
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('Received values of forms: ', values);
            form.resetFields();
            this.setState({ visible: false });
        });
    }

    saveFormRef (formRef) {
        this.formRef = formRef;
    }

    render() {

     var divStyle = {
          height: '200px',
          width: '49%',
          marginBottom: '24px',
          marginRight: '2%',
          display: 'flex',
          alignItems: 'center'
      };

     var buttonStyle = {
         margin:'auto',
         display:'block',
         height:'100%',
         width:'100%'
     }

      return (
      <div>
        <div style={divStyle}>
        <Button icon="plus" style={buttonStyle} onClick={this.showModal}>添加合约</Button>
        <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
        />
        </div>
      </div>
    );
  }
}

