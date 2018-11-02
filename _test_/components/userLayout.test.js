import React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import UserLayout from '../../src/components/UserLayout';


function shallowRender(Component) {
  const renderer = TestUtils.createRenderer();
  renderer.render(<Component />);
  return renderer.getRenderOutput();
}

describe('title', () => {
  it('UserLayout\\\'s title should be Fabric Desktop', () => {
    const userLayout = shallowRender(UserLayout);
    expect(userLayout.props.children[1].props.children.props.children[0].type).toBe('div');
    expect(userLayout.props.children[1].props.children.props.children[0].props.children.props.children).toBe('Fabric Desktop');
  });
});

describe('Some variable should change with the value of the input box', () => {
  const userLayout = TestUtils.renderIntoDocument(<UserLayout />);
  const inputItem = TestUtils.scryRenderedDOMComponentsWithTag(userLayout, 'input');

  it('peerGrpcUrl', () => {
    const input = inputItem[0];
    input.value = 'grpc://127.0.1.1:7051';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('grpc://127.0.1.1:7051');
    expect(userLayout.state.peerGrpcUrl).toBe('grpc://127.0.1.1:7051');
  });

  it('peerEventUrl', () => {
    const input = inputItem[1];
    input.value = 'grpc://127.0.1.1:7053';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('grpc://127.0.1.1:7053');
    expect(userLayout.state.peerEventUrl).toBe('grpc://127.0.1.1:7053');
  });

  it('ordererUrl', () => {
    const input = inputItem[2];
    input.value = 'grpc://127.0.1.1:7050';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('grpc://127.0.1.1:7050');
    expect(userLayout.state.ordererUrl).toBe('grpc://127.0.1.1:7050');
  });

  it('username', () => {
    const input = inputItem[3];
    input.value = 'testOrg1Admin';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('testOrg1Admin');
    expect(userLayout.state.username).toBe('testOrg1Admin');
  });
});

describe('Some variable should be the file path selected by the selector', () => {
  const userLayout = TestUtils.renderIntoDocument(<UserLayout />);
  const inputItem = TestUtils.scryRenderedDOMComponentsWithTag(userLayout, 'input');

  it('certPath', () => {
    const input = inputItem[4];
    input.files.path = '/home/hjs/admin/a05e3c5fc2c10dee7f20a2750a4397c456918526284608ca5f7a12eda496e1e1_sk';
    expect(input.files.path).toBe('/home/hjs/admin/a05e3c5fc2c10dee7f20a2750a4397c456918526284608ca5f7a12eda496e1e1_sk');
  });
});
