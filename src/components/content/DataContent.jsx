import React from 'react';
import { Card,Col,Row,Table,Modal} from 'antd';
import getFabricClientSingleton from '../../util/fabric'

const { Column, ColumnGroup } = Table;

var count = 0;

export default class DataContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:Array().fill(null),
      head:Array().fill(null),
      result:'',
      high:0,
      low:0,
      peerNum:4,
      blackNum:6,
      intelligentContractNum:3,
      transactionNum:6,
      url:"128.0.0.1:7571",
      status:'运行中',
      type:'fabric',
      runningTime:'26',
      startTime:"2018-8-28",
      visible: false,
      currentId:0,
    };

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onQueryInfoCallback = this.onQueryInfoCallback.bind(this);
    this.onQueryBlockCallback = this.onQueryBlockCallback.bind(this);

    var fc = getFabricClientSingleton();
    fc.queryInfo(this.onQueryInfoCallback,'mychannel');
  }

  showModal (id)  {
    this.setState({
      visible: true,
      currentId:id,
    });
  };

  handleOk (e) {
    this.setState({
      visible: false,
    });
  };

  handleCancel (e) {
    this.setState({
      visible: false,
    });
  }

  onQueryInfoCallback(result) {
    console.log(result);
    this.setState({
      low: result['height']['low'],
      high: result['height']['high']
    });
    var fc = getFabricClientSingleton();
    for(var i = this.state.high; i < this.state.low; i++){
      fc.queryBlock(this.onQueryBlockCallback,i,'mychannel')
    }
  }

  onQueryBlockCallback(result) {
    if(result['header']['number'] != 0){
      const tempData = {
      };
      for(let i = 0; i < result['data']['data']['length']; i++){
        let tempTransaction = {
          tx:result['data']['data'][i.toString()]['payload']['header']['channel_header']['tx_id'],
          creatorMSP:result['data']['data'][i.toString()]['payload']['data']['actions']['0']['header']['creator']['Mspid'],
          endorser:result['data']['data'][i.toString()]['payload']['data']['actions']['0']['header']['creator']['Mspid'],
          chaincodeName:result['data']['data'][i.toString()]['payload']['data']['actions']['0']['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['name'],
          type:result['data']['data'][i.toString()]['payload']['header']['channel_header']['typeString'],
          time:result['data']['data'][i.toString()]['payload']['header']['channel_header']['timestamp'],
          reads:{
            0:result['data']['data'][i.toString()]['payload']['data']['actions']['0']['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset']['0']['rwset']['reads'],
            },
          writes:{
            0:result['data']['data'][i.toString()]['payload']['data']['actions']['0']['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset']['0']['rwset']['writes'],
            }
        };
        if(result['data']['data'][i.toString()]['payload']['data']['actions']['0']['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset']['length'] > 1) {
          tempTransaction['reads'][1] = result['data']['data'][i.toString()]['payload']['data']['actions']['0']['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset']['1']['rwset']['reads']
          tempTransaction['writes'][1] = result['data']['data'][i.toString()]['payload']['data']['actions']['0']['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset']['1']['rwset']['writes']
        } else {
          tempTransaction['reads'][1] = '';
            tempTransaction['writes'][1] = '';
        }
        tempData[i.toString()] = tempTransaction;
      }
      const data = this.state.data.slice();
      data[result['header']['number']] = tempData;
      this.setState({data:data});
      console.log(this.state.data);

      const tempHead = {
        key:count++,
        id:result['header']['number'],
        hash:result['header']['data_hash'],
        num:result['data']['data']['length'],
        time:result['data']['data']['0']['payload']['header']['channel_header']['timestamp']
      };
      const head = this.state.head.slice();
      head[tempHead['key']] = tempHead;
      this.setState({head:head});
      console.log(this.state.head);
    }
  }



  render() {

    return (
      <div style={{ background: '#ECECEC', padding: '15px'}}>

        <Row>
          <Col span={12}>
            <Card title={this.state.url} bordered={false}>{this.state.startTime}</Card>
          </Col>
          <Col span={4}>
            <Card title="状态" bordered={false}>{this.state.status}</Card>
          </Col>
          <Col span={4}>
            <Card title="类型" bordered={false}>{this.state.type}</Card>
          </Col>
          <Col span={4}>
            <Card title="时长" bordered={false}>{this.state.runningTime}</Card>
          </Col>
        </Row>

        <p></p>
        <Row gutter={16}>
          <Col span={6}>
            <Card title="peer 节点" bordered={false}>{this.state.peerNum}</Card>
          </Col>
          <Col span={6}>
            <Card title="区块" bordered={false}>{this.state.blackNum}</Card>
          </Col>
          <Col span={6}>
            <Card title="智能合约" bordered={false}>{this.state.intelligentContractNum}</Card>
          </Col>
          <Col span={6}>
            <Card title="交易" bordered={false}>{this.state.transactionNum}</Card>
          </Col>
        </Row>

        <p></p>
        <Row gutter={16}>
          <Col span={14}>
            <div style={{ background: '#FFFFFF'}}>
              <Table dataSource={this.state.head} pagination={{defaultPageSize:4}}>
                <ColumnGroup title="最近区块">
                  <Column
                    title="ID"
                    dataIndex="id"
                    key="id"
                  />
                  <Column
                    title="Hash"
                    key="hash"
                    render={(text, record) => (
                      <span>
                        <a href='#' onClick={() => this.showModal(record.id)}>{record.hash}</a>
                      </span>
                    )}
                  />
                  <Column
                    title="交易数"
                    dataIndex="num"
                    key="num"
                  />
                  <Column
                    title="生成时间"
                    dataIndex="time"
                    key="time"
                  />
                </ColumnGroup>
              </Table>
            </div>
          </Col>
          <Col span={10}>
            <div style={{ background: '#FFFFFF',height:'400px'}}>
              <Table dataSource={this.state.head} pagination={{defaultPageSize:4}}>
                <ColumnGroup title="最近交易">
                  <Column
                    title="hash"
                    key="hash"
                    render={(text, record) => (
                      <span>
                        <a href='#'>{record.content}</a>
                      </span>
                    )}
                  />
                  <Column
                    title="交易时间"
                    dataIndex="time"
                    key="time"
                  />
                </ColumnGroup>
              </Table>
            </div>
          </Col>
        </Row>

        <Modal
          title="Block Detail"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width='60%'
        >
          <strong>Tx:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['tx']: ''}<br />
          <strong>Creator MSP:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['creatorMSP']: ''}<br />
          <strong>Endorser:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['endorser']: ''}<br />
          <strong>Chaincode Name:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['chaincodeName']: ''}<br />
          <strong>Type:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['type']: ''}<br />
          <strong>Time:</strong>{this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['time']: ''}<br />
          <strong>Reads:</strong><br />
          {JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['reads']['0']: '')}<br />
          {JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['reads']['1']: '')}<br />
          <strong>Writes:</strong><br />
          {JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['writes']['0']: '')}<br />
          {JSON.stringify(this.state.data[this.state.currentId] ? this.state.data[this.state.currentId]['0']['writes']['1']: '')}<br />
        </Modal>

      </div>
    );
  }
}


