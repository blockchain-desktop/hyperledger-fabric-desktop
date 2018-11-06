import React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import ChaincodeInvokeContent from '../../../src/components/content/ChaincodeInvokeContent';

describe('function', () => {
  const chaincodeInvokeContent = TestUtils.renderIntoDocument(<ChaincodeInvokeContent />);
  it('onClick()', () => {
    chaincodeInvokeContent.onClick();
  });

  it('onClickCallback()', () => {
    chaincodeInvokeContent.onClickCallback('result');
    expect(chaincodeInvokeContent.state.result).toBe('result');
  });
});

describe('Some variable should change with the value of the input box', () => {
  const chaincodeInvokeContent = TestUtils.renderIntoDocument(<ChaincodeInvokeContent />);
  const inputItem = TestUtils.scryRenderedDOMComponentsWithTag(chaincodeInvokeContent, 'input');

  it('channelChange', () => {
    const input = inputItem[0];
    input.value = 'mychannel';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('mychannel');
    expect(chaincodeInvokeContent.state.channel).toBe('mychannel');
  });

  it('chaincodeIdChange', () => {
    const input = inputItem[1];
    input.value = 'fabcar';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('fabcar');
    expect(chaincodeInvokeContent.state.chaincodeId).toBe('fabcar');
  });

  it('fcnChange', () => {
    const input = inputItem[2];
    input.value = 'queryAllCars';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(input.value).toBe('queryAllCars');
    expect(chaincodeInvokeContent.state.fcn).toBe('queryAllCars');
  });
});

describe('Some variable should change with the value of the select', () => {
  const chaincodeInvokeContent = TestUtils.renderIntoDocument(<ChaincodeInvokeContent />);
  const inputItem = TestUtils.scryRenderedDOMComponentsWithTag(chaincodeInvokeContent, 'Select');
  console.log(inputItem.length);
});
