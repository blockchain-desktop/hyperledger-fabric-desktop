// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
// import PropTypes from 'prop-types';
import { Layout, Menu, Icon } from 'antd';
import DataContent from './content/DataContent';
import ChaincodeInvokeContent from './content/ChaincodeInvokeContent';
import ChaincodeInstallContent from './content/ChaincodeInstallContent';
import { deleteFabricClientSingleton } from '../util/fabric';

import { getConfigDBSingleton } from '../util/createDB';

const fs = require('fs');
const path = require('path');

const db = getConfigDBSingleton();

const { Sider, Content } = Layout;


// 内容路由：在此配置内容key对应的内容类，切换主页面内容
function ContentRoute(props) {
  if (props.contentKey === 1) {
    return <DataContent />;
  } else if (props.contentKey === 2) {
    return <ChaincodeInvokeContent />;
  } else if (props.contentKey === 3) {
    return <ChaincodeInstallContent />;
  }
  return <h1>The sidebar button is not bound to corresponding content</h1>;
}

export default class BasicLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      contentKey: 1,
      language: localStorage.getItem('language'),
    };
    this.onCollapse = this.onCollapse.bind(this);
    this.switchContent = this.switchContent.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onCollapse() {
    this.onClick();
  }

  onClick() {
    this.props.onGetChildMessage(1);

    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json')));
    config.isSign = false;
    const content = JSON.stringify(config);
    fs.writeFileSync(path.join(__dirname, '../../config.json'), content);

    db.update({ id: 0 },
      { $set: { isSign: 1 } },
      {}, () => {
      });
    deleteFabricClientSingleton();
  }

  switchContent(contentKey) {
    this.setState({ contentKey });
  }


  render() {
    const contentStyle = {
      background: '#fff',
      height: '100%',
      margin: '24px 16px',
      padding: '12px',
    };
    return (
      <Layout style={{ height: '100%' }}>
        <Sider
          trigger={<Icon type="logout" />}
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          style={{ paddingTop: '21px' }}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" onClick={() => this.switchContent(1)}>
              <Icon type="snippets" theme="outlined" />
              <span>{this.state.language === 'cn' ? '区块链看板' : 'Block Dashboard' }</span>
            </Menu.Item>
            <Menu.Item key="2" onClick={() => this.switchContent(2)}>
              <Icon type="file-search" theme="outlined" />
              <span>{this.state.language === 'cn' ? '链码调用' : 'Chaincode Invoke' }</span>
            </Menu.Item>
            <Menu.Item key="3" onClick={() => this.switchContent(3)}>
              <Icon type="upload" />
              <span>{this.state.language === 'cn' ? '链码安装' : 'Chaincode Install' }</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={contentStyle}>
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

