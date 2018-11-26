const { exec } = require('child_process');
// 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
const cmd = 'cd ../../resources/key/tx && ./configtxgen -profile OneOrgChannel -outputCreateChannelTx ./mychannel5.tx -channelID mychannel5';
exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
