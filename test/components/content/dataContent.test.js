import React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import DataContent from '../../../src/components/content/DataContent';

describe('function', () => {
  const dataContent = TestUtils.renderIntoDocument(<DataContent />);
  it('onQueryInfoCallback()', () => {
    const result = {
      height: {
        low: 7,
        high: 1,
      },
    };
    dataContent.onQueryInfoCallback(result);
    expect(dataContent.state.low).toBe(7);
    expect(dataContent.state.high).toBe(1);
  });

  it('onQueryBlockCallback()', () => {
    // const dataContent = TestUtils.renderIntoDocument(<DataContent />);
    // const result = {
    //   height: {
    //     low: 7,
    //     high: 1,
    //   },
    // };
    // dataContent.onQueryBlockCallback(result);
  });

  it('handleOk()', () => {
    dataContent.handleOk();
    expect(dataContent.state.visible).toBe(false);
  });

  it('handleCancel()', () => {
    dataContent.handleCancel();
    expect(dataContent.state.visible).toBe(false);
  });

  it('showModal()', () => {
    dataContent.showModal(3);
    expect(dataContent.state.visible).toBe(true);
    expect(dataContent.state.currentId).toBe(3);
  });
});
