var fs = require('fs')
var Sync = require('./sync.js')
var hypercore = require('hypercore')
var hyperdb = require('hyperdb')
var ndjson = require('ndjson')
var homedir = require('os-homedir')()

try {
  var token = JSON.parse(fs.readFileSync(homedir + '/.config/googleauth.json')).access_token
} catch (e) {
  throw new Error('Could not load googleauth token')
}

var feed = hypercore('./db', {valueEncoding: 'json'})
var db = hyperdb([feed])

db.get('/latest', function (err, latest) {
  if (err) return getChanges()
  getChanges(latest[0].value)
})

function getChanges (latest) {
  var opts = {token: token, start: latest}
  console.log(opts)
  var changes = Sync.changesStream(opts)
  var write = Sync.writeStream(db)

  changes.on('latest', function (token) {
    db.put('/latest', token)
  })

  write.on('stats', function (stats) {
    console.log("Wrote", stats.finished, "new changes to DB.")
  })

  changes.pipe(write).on('end', function () {
    console.log('Done')
  })
}

