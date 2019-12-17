const fs = require('fs')
const path = require('path')
const async = require('async')

const resolve = file=>path.resolve(__dirname,file)

function copyFile(file, toDir, cb){
  async.waterfall([
    function(callback){
      fs.exists(toDir,function(bool){
        callback(null, bool)
      })
    },
    function(isExist, callback){
      isExist? callback(null, true): mkdirs(path.dirname(toDir),callback)
    },
    function(p,callback){
      const reads = fs.createReadStream(file)
      const writes = fs.createWriteStream(path.join(path.dirname(toDir),path.basename(file)))
      reads.pipe(writes)
      reads.on('end',function(){
        writes.end()
        callback(null)
      })
      reads.on('error',function(err){
        console.log('read to write occur error')
        callback(true,err)
      })
    }
  ],cb)
}

function mkdirs(p, mode, f, made) {
  if (typeof mode === 'function' || mode === undefined) {
    f = mode;
    mode = 0777 & (~process.umask());
  }
  if (!made)
    made = null;

  var cb = f || function () {};
  if (typeof mode === 'string')
    mode = parseInt(mode, 8);
  p = path.resolve(p);

  fs.mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
      case 'ENOENT':
        mkdirs(path.dirname(p), mode, function (er, made) {
          if (er) {
            cb(er, made);
          } else {
            mkdirs(p, mode, cb, made);
          }
        });
        break;

        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
      default:
        fs.stat(p, function (er2, stat) {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) {
            cb(er, made);
          } else {
            cb(null, made)
          };
        });
        break;
    }
  });
}