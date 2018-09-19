import React from 'react';
import { Layout, Menu, Icon } from 'antd';

const { Header, Sider, Content } = Layout;

export default class BasicLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      contentKey: 1,
    };
    this.onCollapse = this.onCollapse.bind(this);
    this.switchContent = this.switchContent.bind(this);
  }

  onCollapse(collapsed) {
    this.setState({ collapsed });
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
          style={{ minHeight: 1920 }}
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
        </Sider>

        <Layout>
          {/* 在此配置内容key对应的内容类，相当于路由 */}
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            {this.state.contentKey}
          </Content>
        </Layout>

      </Layout>
    );
  }
}
