# Setup Hyperledger Fabric Desktop

## Prerequisites

For normal users and developers, ensure a fabric network running when you use or develop the desktop.

For developers, we have already provide a simple but fully functional fabric network for your development and testing. 

## Install the Desktop

For normal users, download the [desktop](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/releases) suitable for your platform, 
double click and then use the desktop.

For developers,download the [source code](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/releases) suitable for your platform,or 
git clone to your local repo. 

If you are not familiar with starting up a fabric network, you can refer to the following steps:

##  Start up the fabric network

Access to root directory of the project, execute the following command:

```bash
cd fabric/fabcar
./startFabric.sh
```

## Shut down the network

When you no longer use the desktop or have to shut down the fabric network, execute the following command:
```bash
cd fabric/basic-network
./stop.sh
```

