
>  Question:  <br/>
>  For MacOS, how to set the `GOPATH` environment variable when using the Hyperledger Fabric Desktop GUI application. 
 
Answer: 
  
For GUI applications(packaged into DMG and installed on Mac), there are steps to set environment variables: 
 
Temporary variable: 
 
```bash
launchctl setenv `GOPATH`  `value`
```
Restart the application, then the variable works.

Permanent variable:
```bash

vim /etc/launchd.conf 

setenv `GOPATH` `value`

```
Restart the computer, then the variable works.| 
