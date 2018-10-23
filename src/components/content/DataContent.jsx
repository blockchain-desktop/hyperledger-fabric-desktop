// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Col, Row, Table, Modal } from 'antd';
import getFabricClientSingleton from '../../util/fabric';

const logger = require('electron-log');

const { Column, ColumnGroup } = Table;

let count = 0;

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      head: [],
      result: '',
      high: 0,
      low: 0,
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
    };

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onQueryInfoCallback = this.onQueryInfoCallback.bind(this);
    this.onQueryBlockCallback = this.onQueryBlockCallback.bind(this);
    this.onChange = this.onChange.bind(this);

    const fc = getFabricClientSingleton();
    fc.queryInfo(this.onQueryInfoCallback, 'mychannel');
  }

  componentDidMount() {
    this.state.timer = setInterval(() => {
      const fc = getFabricClientSingleton();
      fc.queryInfo(this.onQueryInfoCallback, 'mychannel');
    }, 5000);
  }

  componentWillUnmount() {
    if (this.state.timer != null) {
      clearInterval(this.state.timer);
    }
  }


  onChange(current, pageSize) {
    logger.info(current, pageSize);
    this.setState({
      currentPage: current - 1,
    });
    const fc = getFabricClientSingleton();
    fc.queryInfo(this.onQueryInfoCallback, 'mychannel');
  }


  onQueryInfoCallback(result) {
    logger.info(result);
    this.setState({
      low: result.height.low,
      high: result.height.high,
      height: Math.ceil(result.height.low / 4) * 4,
    });
    logger.warn(this.state.high);
    logger.warn(this.state.low);
    const fc = getFabricClientSingleton();
    logger.info(this.state.data.length);
    count = 0;
    const start = this.state.low - (4 * this.state.currentPage) - 1;
    fc.queryBlock(this.onQueryBlockCallback, 0, 'mychannel');
    for (let i = start; i > start - 4; i--) {
      if (this.state.high >= i) {
        const tempHead = {
          key: count++,
          id: '',
          hash: '',
          num: '',
          time: '',
        };
        const head = this.state.head.slice();
        head[tempHead.key] = tempHead;
        this.setState({ head });
      } else {
        fc.queryBlock(this.onQueryBlockCallback, i, 'mychannel');
      }
    }
  }

  onQueryBlockCallback(result) {
    console.warn(result);
    if (result.header.number !== 0) {
      const tempData = {
      };
      for (let i = 0; i < result.data.data.length; i++) {
        const tempTransaction = {
          tx: result.data.data[i.toString()].payload.header.channel_header.tx_id,
          hash: result.header.data_hash,
          creatorMSP: result.data.data[i.toString()].payload.data.actions['0'].header.creator.Mspid,
          endorser: result.data.data[i.toString()].payload.data.actions['0'].header.creator.Mspid,
          chaincodeName: result.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.chaincode_id.name,
          type: result.data.data[i.toString()].payload.header.channel_header.typeString,
          time: result.data.data[i.toString()].payload.header.channel_header.timestamp,
          reads: {
            0: result.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['0'].rwset.reads,
          },
          writes: {
            0: result.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['0'].rwset.writes,
          },
        };
        if (result.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset.length > 1) {
          tempTransaction.reads[1] = result.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['1'].rwset.reads;
          tempTransaction.writes[1] = result.data.data[i.toString()].payload.data.actions['0'].payload.action.proposal_response_payload.extension.results.ns_rwset['1'].rwset.writes;
        } else {
          tempTransaction.reads[1] = '';
          tempTransaction.writes[1] = '';
        }
        tempData[i.toString()] = tempTransaction;
      }
      const data = this.state.data.slice();
      data[result.header.number] = tempData;
      this.setState({ data });
      console.log(this.state.data);
      logger.info(this.state.data);

      const tempHead = {
        key: count++,
        id: result.header.number,
        hash: (result.header.data_hash).substring(0, 16) + '...',
        num: result.data.data.length,
        time: result.data.data['0'].payload.header.channel_header.timestamp,
      };
      const head = this.state.head.slice();
      head[tempHead.key] = tempHead;
      this.setState({ head });
      logger.info(this.state.head);
    }
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
    return (
      <div style={{ background: '#fff', padding: '2px', minHeight: '900px' }}>
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

        <div style={{ padding: '5px', backgroundColor: '#fff', overflow: 'hidden' }}>
          <Row>
            <Col span={24}>
              <Table
                bordered
                dataSource={this.state.head}
                pagination={{
                  defaultPageSize: 4,
                  showQuickJumper: true,
                  onChange: this.onChange,
                  total: this.state.height }}
              >
                <ColumnGroup title="最近区块">
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
                    title="Hash"
                    key="hash"
                    render={(text, record) => (
                      <span>
                        <a href="#" onClick={() => this.showModal(record.id)}>{record.hash}</a>
                      </span>
                    )}
                  />
                  <Column
                    align="center"
                    title="交易数"
                    dataIndex="num"
                    key="num"
                  />
                  <Column
                    align="center"
                    title="生成时间"
                    dataIndex="time"
                    key="time"
                  />
                </ColumnGroup>
              </Table>
            </Col>
          </Row>
        </div>

        <Modal
          title="Block Detail"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width="60%"
        >
          <strong>Hash:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].hash : ''}<br />
          <strong>Tx:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].tx : ''}<br />
          <strong>Creator MSP:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].creatorMSP : ''}<br />
          <strong>Endorser:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].endorser : ''}<br />
          <strong>Chaincode Name:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].chaincodeName : ''}<br />
          <strong>Type:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].type : ''}<br />
          <strong>Time:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].time : ''}<br />
          <strong>Reads:</strong><br />
          {JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].reads['0'] : '')}<br />
          {JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].reads['1'] : '')}<br />
          <strong>Writes:</strong><br />
          {/* FIXME: 二进制出现乱码.以下仅仅把乱码去除,后续还需重新解析 */}
          {(JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].writes['0'] : '')).replace(/[\\]/g, '').replace(/[�]/g, '')}<br />
          {(JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0'].writes['1'] : '')).replace(/[\\]/g, '').replace(/[�]/g, '')}<br />
        </Modal>
      </div>
    );
  }
}

