// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
// import PropTypes from 'prop-types';
import { Layout, Menu, Icon } from 'antd';
import DataContent from './content/DataContent';
import ChaincodeInvokeContent from './content/ChaincodeInvokeContent';
import ChaincodeInstallContent from './content/ChaincodeInstallContent';
import CARegisterContent from './content/CARegisterContent';
import CAUpdateContent from './content/CAUpdateContent';
import { deleteFabricClientSingleton } from '../util/fabric';

import { getConfigDBSingleton, getInvokeDBSingleton, getChaincodeDBSingleton } from '../util/createDB';
import { getQueryBlockSingleton } from '../util/queryBlock';
import ChannelManangeContent from './content/ChannelManangeContent';


const chaincodedb = getChaincodeDBSingleton();
const configDB = getConfigDBSingleton();
const invokeDB = getInvokeDBSingleton();

const logger = require('electron-log');
const fs = require('fs');
const path = require('path');


const { Sider, Content } = Layout;


// 内容路由：在此配置内容key对应的内容类，切换主页面内容
function ContentRoute(props) {
  if (props.contentKey === 1) {
    return <DataContent />;
  } else if (props.contentKey === 2) {
    return <ChaincodeInvokeContent />;
  } else if (props.contentKey === 3) {
    return <ChaincodeInstallContent />;
  } else if (props.contentKey === 4) {
    return <ChannelManangeContent />;
  } else if (props.contentKey === 5) {
    return <CARegisterContent />;
  } else if (props.contentKey === 6) {
    return <CAUpdateContent />;
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

    configDB.update({ id: 0 },
      { $set: { isSign: 1 } },
      {}, () => {
      });
    getQueryBlockSingleton().then((qb) => {
      qb.deleteAllBlock();
    });
    deleteFabricClientSingleton();
    invokeDB.remove({}, { multi: true }, (err) => {
      if (err) {
        logger.info(err);
      }
    });
    // 每次注销时，删除链码数据库中所有记录
    chaincodedb.remove({}, { multi: true }, (err) => {
      if (err) {
        logger.info(err);
      }
    });
    // 每次注销时，清空peer有关的channel持久化数据信息
    localStorage.removeItem('channels');
    fs.readdirSync(path.join(__dirname, '../../resources/key/users'))
      .forEach(file => fs.unlinkSync(path.join(__dirname, '../../resources/key/users') + '/' + file));
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
              <span>{this.state.language === 'cn' ? '链码调用' : 'Chaincode Invocation' }</span>
            </Menu.Item>
            <Menu.Item key="3" onClick={() => this.switchContent(3)}>
              <Icon type="upload" />
              <span>{this.state.language === 'cn' ? '链码安装' : 'Chaincode Installation' }</span>
            </Menu.Item>
            <Menu.Item key="4" onClick={() => this.switchContent(4)}>
              <Icon type="block" />
              <span>{this.state.language === 'cn' ? '通道管理' : 'Channel Management' }</span>
            </Menu.Item>
            <Menu.Item key="5" onClick={() => this.switchContent(5)}>
              <Icon type="user-add" />
              <span>{this.state.language === 'cn' ? 'CA注册' : 'CA Registration' }</span>
            </Menu.Item>
            <Menu.Item key="6" onClick={() => this.switchContent(6)}>
              <Icon type="team" />
              <span>{this.state.language === 'cn' ? 'CA更新与吊销' : 'CA Update & Revoke' }</span>
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

