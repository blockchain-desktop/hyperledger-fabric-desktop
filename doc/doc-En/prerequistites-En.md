# Installing Development Pre-requisites

## Install the desktop

If you are not familiar with installing the desktop, you should refer to [setup documentation](setup-En.md).

## Install Docker and Docker Compose

You will need the following installed on the platform on which you will be developing on (or for):

* MacOS, *nix, or Windows 10: Docker Docker version 17.06.2-ce or greater is required.
* Older versions of Windows: Docker Toolbox - again, Docker version Docker 17.06.2-ce or greater is required.

Installing Docker for Mac or Windows, or Docker Toolbox will also install Docker Compose. If you already had Docker 
installed, you should check that you have Docker Compose version 1.14.0 or greater installed. If not, we recommend that 
you install a more recent version of Docker.

You can check the version of Docker and Docker Compose you have installed with the following command from a terminal prompt:

```bash
docker --version

docer-compose --version

```

##### Install Node.js Runtime and NPM

We are developing applications for Hyperledger Fabric leveraging the Hyperledger Fabric SDK for Node.js, 

you need to have version 8.9.x or greater of Node.js installed.

>  Note!  <br />
>  Node.js version 9.x is not supported at this time.

Installing Node.js will also install NPM. however it is recommended that you confirm the version of NPM installed. 
You can upgrade the npm tool with the following command:
```bash
npm install npm@5.6.0 -g
```

##### Suggested  Dev IDE

It's recommended that the Development IDE is WebStorm or VSCode.

- [WebStorm](https://www.jetbrains.com/webstorm/)
- [VSCode](https://code.visualstudio.com)

#### Set up your Dev Environment

Technology stack:

- Electron
- React
- Ant Design
- Fabric-Node-sdk

Development technology stack that needs to be installed has been configured in the `package.json` file.
Access to the root directory of project, execute the following command and then you will have all installed:
```
  npm install
```

If the type of chaincode that you are going to install is Golang, there is a environment variable you need 
to set properly. You can make this setting permanent by placing them in the appropriate startup file, 
such as your personal `~/.bashrc` file if you are using the bash shell under Linux.

Now access to the root directory of project, execute the following command:
```bash
npm start
```

you can launch the desktop and view the demonstration. 
