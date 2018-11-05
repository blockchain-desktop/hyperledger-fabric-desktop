import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ChaincodeInstallContent from '../../../src/components/content/ChaincodeInstallContent.jsx';

// Test if click on `add contract` button,a new modal will be poped up or not.
describe('DOM rendering', () => {
  it('Click on add contract button,the contract item should be added.', () => {
    const ChaincodeInstall = TestUtils.renderIntoDocument(<ChaincodeInstallContent />);
    const button = TestUtils.scryRenderedDOMComponentsWithTag(ChaincodeInstall, 'button');
    TestUtils.Simulate.click(button[0]);
    expect(ChaincodeInstall.state.visible).toBe(true);
  });
});

// Test if click on `create` button,a new contract will be added in the todolist or not.
describe('function', () => {
  it('handleCreate() ', () => {
    const ChaincodeInstall = TestUtils.renderIntoDocument(<ChaincodeInstallContent />);
    const todoItemsLength = ChaincodeInstall.state.todolist.length;
    ChaincodeInstall.handleCreate();
    expect(todoItemsLength).toBe(todoItemsLength + 1);
  });
});

// Test if click on `delete` button,a new contract will be delete in the todolist or not.
describe('function', () => {
  it('handleChange() ', () => {
    const ChaincodeInstall = TestUtils.renderIntoDocument(<ChaincodeInstallContent />);
    const todoItemsLength = ChaincodeInstall.state.todolist.length;
    const menuItem = TestUtils.scryRenderedDOMComponentsWithTag(ChaincodeInstall, 'Menu.Item');
    ChaincodeInstall.handleMenuClick(menuItem[2]);
    expect(todoItemsLength).toBe(todoItemsLength - 1);
  });
});
