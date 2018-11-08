# Writing Your Application

## Preview
1. Tutorial
2. Architecture
3. Development

### Tutorial
If you don't know how to use the desktop, please refer to [Tutorial](tutorial-En.md).

### Architecture

- [Architecture](./architect-En.md)

### Development

1. Install prerequisites
2. Development Guides
3. Code specification
4. Development Route

#### Install prerequisites

To install all the prerequisites, you need to refer to [Install Prerequisites](./prerequistites-En.md)

#### Development Guides

We will take the development process of `channel management` as an example to introduce how to develop a new feature of 
the desktop. If you are willing to have the feature with a single user interface, we can go through the following steps:
1. Write a new user interface, name it `ChannelManageContent.jsx`.
2. Write a new function, name it `ChannelManage` function.
3. Create a new database if data persistence needed.
4. Check the code specification before submitting.

##### Write a new user interface

Access to  directory `src/components/content`,you can add a new file `ChannelManageContent.jsx`. After successfully 
added, you need to add a new content route in `src/components/BasicLayout.jsx` as an entrance.

We are using React to build user interface, and it's highly recommended to write React components with ES6:
```react
import React,{ Component } from 'react';

class MyComponent extends Component {
  render() {
    return (
      <div>a new component</div>
    );
  }
}

```
If there are multiple components and tightly coupled, you can ignore the constraint that only one component is allowed
in one `.jsx` file and you can declare multiple tightly coupled components in one `.jsx` file.

##### Write a new function 

Of course, you can create a new file, such as `channel.js`, to declare and implement the `ChannelManage` function.
By the way, it's recommended to declare and implement `ChannelManage` function in the existed `fabric.js` file.

##### Create a new database 

Create a new database if data persistence needed. You can add a persistent datastore with automatic loading using
```javascript
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'path/to/datafile', autoload: true });
```
or you can add with Singleton pattern in `src/util/createDB.js`:
```javascript
let chaincodeDB;
export function getChaincodeDBSingleton() {
  if (!chaincodeDB) {
    chaincodeDB = new Datastore({ filename: path.join(__dirname, '../../resources/persistence/chaincode.db'), autoload: true });
  }
  return chaincodeDB;
}
```


##### Check the code specification

Check code specification before submitting.You can execute the following command to check your code:
```bash
npm run lint
```
and fix it automatically by
```bash
npm run lintFix
```

When there are some problems that cannot be fixed automatically, you need to manually repair according to the IDE's prompts.

> Note! <br/>
> You need to set the IDE's code quality tool to Eslint when using IDE's automatically prompt.

#### Code specification

For code specification, we take ESlint and try to fully satisfy the ESlint constraint.But in some special cases, 
we have released the ESlint constraint appropriately. Currently, We released the ESLint constraint in two places:
1. We use underline `_` to distinguish function private or public.  
2. If there are multiple components and tightly coupled, you can ignore the constraint that only one component is allowed
   in one `.jsx` file and you can declare multiple tightly coupled components in one `.jsx` file.

If you encounter an ESlint constraint that needs to be properly released during the development process, truly that 
the ESlint specification is not properly constrained, you can open a relevant issue on [github](https://github.com/blockchain-desktop/hyperledger-fabric-desktop).
This ESlint constraint will be released after ascertained.

#### Development Route

* v0.1.0 : basic features (.eg.,Block Dashboard, Chaincode Install, Chaincode Invoke).
* v0.2.0 : Add `channel management` and other features.
* v0.3.0~: Add new feature and improve infrastructure.

Hyperledgr fabric desktop is currently in the v0.1.0 version phase.
