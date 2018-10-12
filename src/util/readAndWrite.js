const fs = require('fs');
const path = require('path');

function write(content, strPath) {
  const file = path.join(strPath);
  fs.writeFile(file, content, (err) => {
    if (err) {
      return console.log(err);
    }
    return console.log('success');
  });
}


exports.write = write;
