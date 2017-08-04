var fs = require('fs')
var GDrive = require('./gdrive.js')
var args = require('minimist')(process.argv.slice(2))
var homedir = require('os-homedir')()
var hypercore = require('hypercore')
var hyperdb = require('hyperdb')

try {
  var token = JSON.parse(fs.readFileSync(homedir + '/.config/googleauth.json')).access_token
} catch (e) {
  throw new Error('Could not load googleauth token')
}

var feed = hypercore('./db', {valueEncoding: 'json'})
var db = hyperdb([feed])
var drive = GDrive(db, {token: token})

handleArgs()

function handleArgs () {
  var cmd = args._[0]
  var src = args._[1]
  var dest = args._[2]

  if (cmd === 'get') {
    if (dest) {
      drive.get(src).pipe(fs.createWriteStream(dest))
      return
    }
    drive.get(src).pipe(process.stdout)
    return
  }

  if (cmd === 'sync') {
  
  }

  console.log('usage: google-drive-storage <command> <src> <dest>')
}
