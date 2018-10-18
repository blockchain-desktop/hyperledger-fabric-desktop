// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
// import PropTypes from 'prop-types';
import { Layout, Menu, Icon, Button } from 'antd';
import DataContent from './content/DataContent';
import ChaincodeInvokeContent from './content/ChaincodeInvokeContent';
import ChaincodeInstallContent from './content/ChaincodeInstallContent';
import {deleteFabricClientSingleton} from '../util/fabric';

const { Sider, Content } = Layout;

const fs = require('fs');
const path = require('path');

// 内容路由：在此配置内容key对应的内容类，切换主页面内容
function ContentRoute(props) {
  if (props.contentKey === 1) {
    return <DataContent />;
  } else if (props.contentKey === 2) {
    return <ChaincodeInvokeContent />;
  } else if (props.contentKey === 3) {
    return <ChaincodeInstallContent />;
  }
  return <h1>侧边栏按钮未绑定对应内容</h1>;
}

export default class BasicLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      contentKey: 1,
    };
    this.onCollapse = this.onCollapse.bind(this);
    this.switchContent = this.switchContent.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onCollapse(collapsed) {
    this.setState({ collapsed });
  }

  onClick() {
    this.props.onGetChildMessage(false);  // 调用父组件传来的函数，将数据作为参数传过去
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json')));
    config.isSign = false;
    const content = JSON.stringify(config);
    fs.writeFileSync(path.join(__dirname, '../../config.json'), content);
    deleteFabricClientSingleton();
  }

  switchContent(contentKey) {
    this.setState({ contentKey });
  }


  render() {
    return (
      <Layout >
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          style={{minHeight: '1366px'}}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" onClick={() => this.switchContent(1)}>
              <Icon type="user" />
              <span>区块链数据看板</span>
            </Menu.Item>
            <Menu.Item key="2" onClick={() => this.switchContent(2)}>
              <Icon type="video-camera" />
              <span>智能合约调用</span>
            </Menu.Item>
            <Menu.Item key="3" onClick={() => this.switchContent(3)}>
              <Icon type="upload" />
              <span>智能合约安装</span>
            </Menu.Item>
          </Menu>
          <div style={{ margin: '500px 50px'  }}>
              <Button type="primary" style={{ width: '80%' }} onClick={this.onClick}>退出</Button>
          </div>
        </Sider>
        <Layout>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <ContentRoute contentKey={this.state.contentKey} />
          </Content>
        </Layout>

      </Layout>
    );
  }
}
//
// BasicLayout.prototype = {
//   onGetChildMessage: PropTypes.func,
//   contentKey: PropTypes.number,
// };

