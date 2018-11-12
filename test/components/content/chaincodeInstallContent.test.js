import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ChaincodeInstallContent from '../../../src/components/content/ChaincodeInstallContent.jsx';

// Required: Test if click on `add contract` button,a new modal will be poped up or not.
describe('DOM rendering', () => {
  it('Click on add contract button,the contract item should be added.', () => {
    const ChaincodeInstall = TestUtils.renderIntoDocument(<ChaincodeInstallContent />);
    const button = TestUtils.scryRenderedDOMComponentsWithTag(ChaincodeInstall, 'button');
    TestUtils.Simulate.click(button[0]);
    expect(ChaincodeInstall.state.visible).toBe(true);
  });
});

// Required: Test if click on `create` button,a new contract will be added in the todolist or not.
describe('function', () => {
  it('handleCreate() ', () => {
    const ChaincodeInstall = TestUtils.renderIntoDocument(<ChaincodeInstallContent />);
    ChaincodeInstall.handleCreate();
  });
});

// Required: Test if click on 'delete' button. a contract will be deleted in the todolist or not.

describe('function', () => {
  it('handledelete', () => {
    const ChaincodeInstall = TestUtils.renderIntoDocument(<ChaincodeInstallContent />);
    ChaincodeInstall.handleChange(ChaincodeInstall.state.todolist);
  });
});

// Optional: Test input's value is valid or not.
// describe('value', () => {
//   const inputItems = TestUtils.scryRenderedDOMComponentsWithTag(ChaincodeInstall, 'input');
//   it('name', () => {
//     const input = inputItems[0];
//     input.value = 'fabcar1';
//     TestUtils.Simulate.change(input);
//     TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
//     expect(/^[A-Za-z0-9]+$/.test(input.value)).toBe(true);
//   });
//   it('version', () => {
//     const input = inputItems[1];
//     input.value = '1.0';
//     TestUtils.Simulate.change(input);
//     TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
//     expect(/^\d+(.\d+)?$/.test(input.value)).toBe(true);
//   });
//   it('channel', () => {
//     const input = inputItems[2];
//     input.value = 'mychannel';
//     TestUtils.Simulate.change(input);
//     TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
//     expect(/^[A-Za-z0-9]+$/.test(input.value)).toBe(true);
//   });
//   it('path', () => {
//     const input = inputItems[3];
//     input.value = 'chaincode';
//     TestUtils.Simulate.change(input);
//     TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
//     expect(/^\d+(.\d+)?$/.test(input.value)).toBe(true);
//   });
// });
//
