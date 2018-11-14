// Copyright 2018 The hyperledger-fabric-desktop Authors. All rights reserved.

import React from 'react';
import { Layout } from 'antd';

const path = require('path');


const loadingImageUrl = path.join(__dirname, '../../resources/styles/image/loading.gif');
// const logoUrl = path.join(__dirname, '../../resources/styles/image/logo/logo_Transparent.png');


export default class LoadingLayout extends React.Component {
  render() {
    const contentStyle = {
      height: '100%',
      background: '#fff',
    };

    const loadingImageStyle = {
      width: '100px',
      margin: '15px -10px',
      display: 'inline-block',
      verticalAlign: 'middle',
      animation: 'increase 0.5s ease-out',
    };

    // const logoImageStyle = {
    //   width: '100px',
    //   display: 'inline-block',
    //   verticalAlign: 'middle',
    //   animation: 'increase 0.5s ease-out',
    // };

    const logoDivStyle = {
      height: '28%',
      margin: '10px 20px',
      textAlign: 'center',
    };

    const loadingDivStyle = {
      margin: '10px 20px',
      textAlign: 'center',
    };

    const loadingTextStyle = {
      fontFamily: 'sans-serif',
      fontSize: '40px',
      color: '#666',
      verticalAlign: 'top',
      lineHeight: '100px',
      animation: 'fadein 0.75s ease-out',
    };
    return (
      <Layout style={contentStyle}>
        <div style={logoDivStyle}>
          {/* <img src={logoUrl} style={logoImageStyle} alt="loading" /> */}
          {/* <span style={LoadingTextStyle}>&nbsp;&nbsp;Fabric Desktop</span> */}
        </div>
        <div style={loadingDivStyle}>
          <img src={loadingImageUrl} style={loadingImageStyle} alt="loading" />
          <span style={loadingTextStyle}>Starting App</span>
        </div>

      </Layout>
    );
  }
}

