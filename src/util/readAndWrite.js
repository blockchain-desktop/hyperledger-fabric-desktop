
function write(content,strPath) {
  var fs = require('fs');
  var path = require('path');
  var file = path.join(strPath);
  fs.writeFile(file, content, function (err) {
    if(err){
      return console.log(err);
    }
    return console.log('success');
  })
}


exports.write = write;