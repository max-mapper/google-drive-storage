var url = require('url')
var request = require('request')
var through = require('through2')
var debug = require('debug')('google-drive-storage')

var baseURL = 'https://www.googleapis.com/drive/v3/'

function GDrive (options) {
  if (!(this instanceof GDrive)) return new GDrive(options)
  return function (filename) {
    return new GFile(filename, options)
  }
}

module.exports = GDrive

function GFile (filename, options) {
  if (!(this instanceof GFile)) return new GFile(filename, options)
  this.filename = filename
  this.options = options
}

GFile.prototype.open = function (cb) {
  if (cb) process.nextTick(cb)
}

GFile.prototype.write = function (offset, data, cb) {
  if (cb) process.nextTick(cb)
}

GFile.prototype.read = function (offset, length, cb) {
  var reqOpts = {
    method: 'GET'
    url: baseURL
    headers: {
     'Content-Type': opts.contentType || 'text/plain',
     'Authorization': "Bearer " + token
    },
    json: opts.json
  }
}

GFile.prototype.del = function (offset, len, cb) {
  throw new Error('del not supported by dat-google-drive')
  if (cb) process.nextTick(cb)
}

GFile.prototype.close = function (cb) {
  if (cb) nextTick(cb)
}

GFile.prototype.destroy = function (cb) {
  if (cb) nextTick(cb)
}
