var path = require('path')
var duplex = require('duplexify')
var request = require('request')
var debug = require('debug')('google-drive-storage')
module.exports = GDrive

function GDrive (db, options) {
  if (!(this instanceof GDrive)) return new GDrive(db, options)
  this.options = options
  this.db = db
}

GDrive.prototype.get = function (filename) {
  var self = this
  var dbpath = path.resolve('/name/', filename).slice(1)
  var stream = duplex()
  self.db.get(dbpath, function (err, data) {
    if (err) throw err
    var file = data[0].value
    debug(file)
    var reqOpts = {
      url: 'https://www.googleapis.com/drive/v3/files/' + file.fileId + '?alt=media',
      headers: {
       'Authorization': 'Bearer ' + self.options.token
      }
    }
    debug(reqOpts)
    stream.setReadable(request(reqOpts))
  })
  return stream
}