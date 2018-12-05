const fs = require('fs');
const logger = require('electron-log');
/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
  logger.info('src', src);
  logger.info('dist', dist);
  function _copy(err, src1, dist1) {
    if (err) {
      callback(err);
    } else {
      fs.readdir(src1, (err1, paths) => {
        if (err1) {
          callback(err1);
        } else {
          paths.forEach((path) => {
            const _src1 = src1 + '/' + path;
            const _dist1 = dist1 + '/' + path;
            fs.stat(_src1, (err2, stat) => {
              if (err2) {
                callback(err2);
              } else if (stat.isFile()) {
                // 是文件则复制
                fs.writeFileSync(_dist1, fs.readFileSync(_src1));
              } else if (stat.isDirectory()) {
                // 当是目录是，递归复制
                copyDir(_src1, _dist1, callback);
              }
            });
          });
        }
      });
    }
  }

  fs.access(dist, (err) => {
    if (err) {
      // 目录不存在时创建目录
      fs.mkdirSync(dist);
    }
    _copy(null, src, dist);
  });
}

function copyFile(src, dist) {
  fs.writeFileSync(dist, fs.readFileSync(src));
}

module.exports = {
  copyDir,
  copyFile,
};
