var url = require('url')
var request = require('request')
var through = require('through2')
var debug = require('debug')('dat-google-drive')

module.exports.getCurrentChange = function getCurrentChange (cb) {
    var reqOpts = {
      method: 'GET',
      url: 'https://www.googleapis.com/drive/v3/changes/startPageToken',
      headers: {
       'Authorization': "Bearer " + opts.token
      },
      json: true
    }
    request(reqOpts, function (err, resp, json) {
      if (err) return cb(err)
      var startPageToken = json.startPageToken
      if (!startPageToken) return cb(new Error('Didnt get startPageToken: ' + json))
      cb(null, startPageToken)
    })
  }
  
module.exports.changesStream = function changesStream (opts) {
  var start = opts.start || 1
  var results = []
  debug('getChanges start=', start)
  get(start, handleGet)
  var stream = through.obj()
  return stream
  function get (start, cb) {
    var reqOpts = {
      method: 'GET',
      url: 'https://www.googleapis.com/drive/v3/changes?pageToken=' + start + '&pageSize=1000',
      headers: {
       'Authorization': "Bearer " + opts.token
      },
      gzip: true,
      json: true
    }
    debug('getChanges', reqOpts.url)
    request(reqOpts, cb)
  }
  function handleGet (err, resp, json) {
    if (err || resp.statusCode > 299) return stream.destroy(new Error('Response error: ' + err || resp.statusCode))
    var next = json.nextPageToken
    if (json.newStartPageToken) stream.emit('latest', json.newStartPageToken)  
    var changes = json.changes
    if (!changes) stream.destroy(new Error('Received no changes: ' + json))
    results = results.concat(json.changes)
    json.changes.forEach(function (change) {
      stream.write(change)
    })
    if (!next) return stream.end()
    get(next, handleGet)
  }
}

module.exports.writeStream = function writeStream (db) {
  var finished = 0
  var written = 0
  var done = false
  var stream = through.obj(function (obj, enc, next) {
    var nameKey
    var idKey
    if (obj.file) nameKey = 'name/' + obj.file.name
    idKey = 'id/' + obj.fileId    
    if (obj.removed) {
      if (nameKey) db.put(nameKey, null)
      db.put(idKey, null)
      return next()
    }
    written++
    db.put(nameKey, obj, checkDone)
    db.put(idKey, nameKey, checkDone)
    next()
    function checkDone (err) {
      finished++
      if (done && finished === written) {
        stream.emit('stats', {finished: finished})
        done()
      }
    }
  }, function (cb) {
    // mafintosh says this should technically defer finish, not end, but through2 cant do that rn
    done = cb
    if (finished === written) {
      stream.emit('stats', {finished: finished})
      done()
    }
  })

  return stream
}
