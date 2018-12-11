# Tutorial

## Preview
1. Start your first tutorial
2. Contact us

### Start your first tutorial

#### Install the desktop

Following the [setup documentation](./setup-En.md) to install Hyperledger Fabric Desktop.

#### Start your tutorial

Double click and run the desktop, it contains four parts:
1. Login
2. Block Dashboard
3. Chaincode Invoke
4. Chaincode Install  

##### Login

![login](../img/img-En/signin.png)

Suppose you input those fields:

- peer grpc url : `grpc://localhost:7051` (replace this with your peer grpc url)
- peer event url : `grpc://localhost:7053` (replace this with your peer event url)
- orderer url : `grpc://localhost:7050`    (replace this with your orderer url)
- username : ` Org1Admin` (type a username)
- certificate: choosing a certificate of user
- private key: choosing a private key of user

After successful adding, click the `Sign in` button.

> Note!  <br />
> In hyperledger fabric,there are three or more roles,eg.,peer,orderer,user. The desktop is oriented to the role 'user',
> and there are two kinds: 'admin user' and 'normal user'. 'Admin user' can install and instantiate the chaincode while
> 'normal user' can only invoke and query the chaincode.

##### Block Dashboard

We can view information about blocks on block dashboard.

![block dashboard](../img/img-En/datacontent.png)

Click on any row in the 'Hash' column of the table, you can view related information.

![Hash](../img/img-En/hash.png)

##### Chaincode Invoke

![chaincode invoke](../img/img-En/ccquery.png)

Suppose you input those fields:

- Channel Name : `mychannel` (replace this with your channel name)
- Chaincode Name :`fabcar` (replace this with your chaincode name)
- Function Name : `queryAllCars` (replace this with your function name)
- Parameter : null  (If the function doesn't need any parameter)
- Methods : query （query or invoke）

Click on the `send` button,then you will see the result.

>  Note!  <br />
>  The operation `query` only queries data,no block will be generated.
>  The operation `invoke` can initiate a new bill,and generate a new block
>  If there is a new bill initiated, we can see a new generated block on
>  'Block Dashboard', according to the time setting of the fabric network.

##### Chaincode Install

Before we start, if chaincode's type is Golang,there is a environment variable you need to set for the GUI program properly; 
you can make this setting permanent by placing them in the appropriate startup file such as your personal` ~/.bashrc` file, 
as same as setting environment variables for terminal program, if you are using the bash shell under Linux, with something like:
```bash
export GOPATH=$HOME/go
```

> Note!<br />
> If you are using macOs, GUI program and terminal program use two different sets of environment variables.
> As for setting environment variables for GUI program on macOs, you can refer to [Desktop-FAQ](../doc-En/Desktop-FAQ-En.md).

We can view all the smart contracts that have been added on the page.

![chaincode install](../img/img-En/ccinstall.png)

Click the `add` button, a window will be popped up. 

![add chaincode](../img/img-En/ccinstallwindow.png)

Suppose you input those fields:

- Chaincode Name* :`fabcar4` (replace this with your chaincode name)
- Version* :`4.0` （type a version）
- Channel Name* :`mychannel` (so far,you can't change the value)
- Chaincode Path* :`github.com/hyperledger/fabric-dev-network/chaincode/fabcar/go`
- Description :`car` (describe functions of the chaincode)

>  Note!  <br />
>  If chaincode's type is Golang, then the path is the fully qualified
>  package name under the `src` folder of `GOPATH`.For example, You can create a new folder `cc`
>  under the `src` folder of `GOPATH` and put your chaincode file there.
>  Then just need to type `cc` in the `Chaincode Path` field.


After the chaincode added, you can perform operations like `install`,`instantiate`,`delete`.

![new chaincode window](../img/img-En/ccoperate.png)

### Contact us

If there are any problems when using the desktop, please raise a new [issue](https://github.com/blockchain-desktop/hyperledger-fabric-desktop/issues)
on github, we will handle it in time, and thank you sincerely for your feedback.
