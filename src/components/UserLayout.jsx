// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

// TODO: 登录页（秘钥导入页面）
import React from 'react';
import { Button, Input, Layout, Avatar } from 'antd';
import getFabricClientSingleton from '../util/fabric';
import { getConfigDBSingleton } from '../util/createDB';

const logger = require('electron-log');

const db = getConfigDBSingleton();

const { Content } = Layout;

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      peerUrl: 'grpc://localhost:7051',
      ordererUrl: 'grpc://localhost:7050',
      username: 'Org1Admin',
      certPath: '',
      keyPath: '',
    };


    this.onClick = this.onClick.bind(this);
    this.peerChange = this.peerChange.bind(this);
    this.cerImport = this.cerImport.bind(this);
    this.priImport = this.priImport.bind(this);
    this.ordererChange = this.ordererChange.bind(this);
    this.usernameChange = this.usernameChange.bind(this);
  }


  onClick() {
    db.update({ id: 0 },
      { $set: { isSign: true,
        peerUrl: this.state.peerUrl,
        ordererUrl: this.state.ordererUrl,
        username: this.state.username,
        path: 'src/components/content/resources/key/' } },
      {}, () => {
      });
    this.props.onGetChildMessage(true);
    const fc = getFabricClientSingleton();
    logger.info(this.state.certPath);
    fc.importCer(this.state.keyPath, this.state.certPath);
  }

  peerChange(event) {
    this.setState({ peerUrl: event.target.value });
  }

  cerImport() {
    const selectedFile = document.getElementById('cerFiles').files[0];// 获取读取的File对象
    this.setState({ certPath: selectedFile.path });
  }


  priImport() {
    const selectedFile = document.getElementById('priFiles').files[0];// 获取读取的File对象
    this.setState({ keyPath: selectedFile.path });
  }

  ordererChange(event) {
    this.setState({ ordererUrl: event.target.value });
  }

  usernameChange(event) {
    this.setState({ username: event.target.value });
  }


  render() {
    return (
      <Layout >
        <Content style={{margin: '32px 16px', padding: '24px', background: '#fff', width: '50%', height: '100%',minHeight:'900px' }}>
          <div style={{ margin: '32px 0' }}>
            <center><Avatar size={64} icon="user" /></center>
          </div>

          <div style={{ margin: '24px 0' }}>
            peer url：&thinsp;&thinsp;
            <Input type="text" value={this.state.peerUrl} style={{ width: '75%' }} onChange={this.peerChange} />
          </div>

          <div style={{ margin: '24px 0' }}>
            orderer url：&thinsp;
            <Input type="text" value={this.state.ordererUrl} style={{ width: '75%' }} onChange={this.ordererChange} />
          </div>

          <div style={{ margin: '24px 0' }}>
            username：&thinsp;&thinsp;
            <Input type="text" value={this.state.username} style={{ width: '75%' }} onChange={this.usernameChange} />
          </div>

          <div style={{ margin: '24px 0' }}>
            certificate：
            <input type="file" id="cerFiles" style={{ width: '75%' }} onChange={this.cerImport} />
          </div>

          <div style={{ margin: '24px 0' }}>
            private key：
            <input type="file" id="priFiles" style={{ width: '75%' }} onChange={this.priImport} />
          </div>

          <div style={{ margin: '24px 0' }}>
            <Button type="primary" style={{ width: '100%' }} onClick={this.onClick}>登录</Button>
          </div>

        </Content>
      </Layout>


    );
  }
}
