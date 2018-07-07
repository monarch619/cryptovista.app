const ncp = require('ncp').ncp

ncp.limit = 16

function copy (source, destination) {
  return new Promise(function (resolve, reject) {
    ncp(source, destination, function (err) {
      if (err) {
        reject(err)
      }
      resolve(true)
    })
  })
}

copy('src', 'dist')
