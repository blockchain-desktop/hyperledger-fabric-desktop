// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Col, Row, Table, Modal } from 'antd';
import { getQueryBlockSingleton, deleteQueryBlockSingleton } from '../../util/queryBlock';

const logger = require('electron-log');

const { Column, ColumnGroup } = Table;


export default class DataContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      peerNum: 4,
      blackNum: 6,
      intelligentContractNum: 3,
      transactionNum: 6,
      url: '128.0.0.1:7571',
      status: '运行中',
      type: 'fabric',
      runningTime: '26',
      startTime: '2018-8-28',
      visible: false,
      currentId: 0,
      currentPage: 0,
      height: 0,
      timer: null,
      pageSize: 4,
      language: localStorage.getItem('language'),
      block: [],
    };

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onChange = this.onChange.bind(this);

    getQueryBlockSingleton().then((qb) => {
      qb.queryBlockFromDatabase(this.state.currentPage).then((block) => {
        if (block !== 'Data does not need change') {
          if (this.state.currentPage === 0) {
            const height = parseInt(block[0].id, 0);
            this.setState({ height });
          }
          this.setState({ block });
          console.log('blocks:', this.state.block);
        }
      });
    });
  }

  componentDidMount() {
    this.state.timer = setInterval(() => {
      getQueryBlockSingleton().then((qb) => {
        qb.queryBlockFromDatabase(this.state.currentPage).then((block) => {
          if (block !== 'Data does not need change') {
            if (this.state.currentPage === 0) {
              const height = parseInt(block[0].id, 0);
              this.setState({ height });
            }
            this.setState({ block });
            console.log('blocks:', this.state.block);
          }
          qb.isNeedToQuery();
        });
      });
    }, 3000);
  }

  componentWillUnmount() {
    if (this.state.timer != null) {
      clearInterval(this.state.timer);
      deleteQueryBlockSingleton();
    }
  }


  onChange(current, pageSize) {
    logger.info(current, pageSize);
    this.setState({
      currentPage: current - 1,
    });
    getQueryBlockSingleton().then((qb) => {
      qb.queryBlockFromDatabase(this.state.currentPage).then((block) => {
        if (block !== 'Data does not need change') {
          if (this.state.currentPage === 0) {
            const height = parseInt(block[0].id, 0);
            this.setState({ height });
          }
          this.setState({ block });
          console.log('blocks:', this.state.block);
        }
      });
    });
  }


  handleOk() {
    this.setState({
      visible: false,
    });
  }

  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  showModal(id) {
    this.setState({
      visible: true,
      currentId: id,
    });
  }


  render() {
    const outerDivStyle = {
      background: '#fff',
      padding: '2px',
      height: '100%',
    };
    const tableDivStyle = {
      padding: '10px',
      backgroundColor: '#fff',
      overflow: 'hidden',
    };
    return (
      <div style={outerDivStyle}>
        {/* <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}> */}
        {/* <div> */}
        {/* <Row> */}
        {/* <Col span={12} > */}
        {/* <Card title={this.state.url} bordered={false} >{this.state.startTime}</Card> */}
        {/* </Col> */}
        {/* <Col span={4} > */}
        {/* <Card title="状态" bordered={false} >{this.state.status}</Card> */}
        {/* </Col> */}
        {/* <Col span={4} > */}
        {/* <Card title="类型" bordered={false} >{this.state.type}</Card> */}
        {/* </Col> */}
        {/* <Col span={4} > */}
        {/* <Card title="时长" bordered={false} >{this.state.runningTime}</Card> */}
        {/* </Col> */}
        {/* </Row> */}
        {/* </div> */}
        {/* <div style={{ margin: '2px 0' }}> */}
        {/* <Row gutter={2}> */}
        {/* <Col span={6}> */}
        {/* <Card title="peer 节点" bordered={false} >{this.state.peerNum}</Card> */}
        {/* </Col> */}
        {/* <Col span={6}> */}
        {/* <Card title="区块" bordered={false} > {this.state.blackNum}</Card> */}
        {/* </Col> */}
        {/* <Col span={6} > */}
        {/* <Card title="智能合约" bordered={false} >{this.state.intelligentContractNum}</Card> */}
        {/* </Col> */}
        {/* <Col span={6} > */}
        {/* <Card title="交易" bordered={false} >{this.state.transactionNum}</Card> */}
        {/* </Col> */}
        {/* </Row> */}
        {/* </div> */}

        <div style={tableDivStyle}>
          <Row>
            <Col span={24}>
              <Table
                bordered
                dataSource={this.state.block}
                pagination={{
                  defaultPageSize: this.state.pageSize,
                  showQuickJumper: true,
                  onChange: this.onChange,
                  total: this.state.height }}
              >
                <ColumnGroup title={this.state.language === 'cn' ? '最近区块' : 'Current Blocks'}>
                  <Column
                    defaultSortOrder="descend"
                    align="center"
                    title="ID"
                    dataIndex="id"
                    key="id"
                    sorter={(a, b) => a.id - b.id}
                  />
                  <Column
                    align="center"
                    title={this.state.language === 'cn' ? '哈希值' : 'Block Hash'}
                    key="hash"
                    render={(text, record) => (
                      <span>
                        <a href="#" onClick={() => this.showModal(record.key)}>{record.hash}</a>
                      </span>
                    )}
                  />
                  <Column
                    align="center"
                    title={this.state.language === 'cn' ? '数量' : 'Transaction Number'}
                    dataIndex="num"
                    key="num"
                  />
                  <Column
                    align="center"
                    title={this.state.language === 'cn' ? '生成时间' : 'Generate time'}
                    dataIndex="key"
                    key="key"
                  />
                </ColumnGroup>
              </Table>
            </Col>
          </Row>
        </div>

        <Modal
          title={this.state.language === 'cn' ? '区块' : 'Block Detail'}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width="60%"
          centered
        >
          <strong>Hash:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId].hash : '1'}<br />
          <strong>Tx:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].tx : '1'}<br />
          <strong>Creator MSP:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].creatorMSP : ''}<br />
          <strong>Endorser:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].endorser : ''}<br />
          <strong>Chaincode Name:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].chaincodeName : ''}<br />
          <strong>Type:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].type : ''}<br />
          <strong>Time:</strong>{this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].time : ''}<br />
          <strong>Reads:</strong><br />
          {JSON.stringify(this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].reads[0] : '')}<br />
          {JSON.stringify(this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].reads[1] : '')}<br />
          <strong>Writes:</strong><br />
          {/* FIXME: 二进制出现乱码.以下仅仅把乱码去除,后续还需重新解析 */}
          {(JSON.stringify(this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].writes[0] : '')).replace(/[\\]/g, '').replace(/[�]/g, '')}<br />
          {(JSON.stringify(this.state.block[this.state.currentId] ? this.state.block[this.state.currentId][0].writes[1] : '')).replace(/[\\]/g, '').replace(/[�]/g, '')}<br />
        </Modal>
      </div>
    );
  }
}

