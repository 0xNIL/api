const http = require('http')
const url = require('url')
const request = require('superagent')
const fs = require('fs')
const utils = require('ethereumjs-util')
const web3 = new require('web3')

const port = 9093

function resError(res, err) {
  log(err)
  res.statusCode = 500
  res.json({success: false, err})
}

function log(what) {
  console.log(what)
  fs.appendFileSync('access.log', new Date().toISOString() + ' ' + what + '\n')
}

const server = http.createServer((req, res) => {

  let pathname = url.parse(req.url).pathname
  if (pathname === '/favicon.ico') {
    res.end()
    return
  }

  const [tmp, screenName, id, address] = pathname.split('/')

  if (id && /^[a-z0-9_]+$/i.test(screenName) && screenName.length <= 15 && /^\d{18,20}$/.test(id) && id.length < 20 && web3.utils.isAddress(address)) {

    log('GET ' + pathname)

    res.setHeader('Access-Control-Allow-Origin', '*')
    request
    .get(`https://twitter.com/${screenName}/status/${id}`)
    .then(function (res2) {
      if (res2.text) {
        let content = res2.text.match(/"og:description" content="[^"]+"/)[0].split('"')[3].replace(/^.{1}|.{1}$/g, '')

        if (/^0x[0-9a-f]{130}/.test(content)) {

          const msgHash = utils.hashPersonalMessage(utils.toBuffer(`${screenName}@tweedentity`))
          const sgn = utils.stripHexPrefix(content)
          const r = new Buffer(sgn.slice(0, 64), 'hex')
          const s = new Buffer(sgn.slice(64, 128), 'hex')
          const v = parseInt(sgn.slice(128, 130), 16) // + 27
          const pub = utils.ecrecover(msgHash, v, r, s)
          const addr = utils.setLength(utils.fromSigned(utils.pubToAddress(pub)), 20)
          if (utils.bufferToHex(addr).toLowerCase() === address.toLowerCase()) {
            res.statusCode = 200
            res.json({success: true})
          } else resError(res, 'Wrong signature.') // wrong signature
        } else resError(res, 'Wrong tweet.') // wrong tweet

      }
    })
    .catch(function (err) {
      log('ERROR ' + err)
      resError(res, 'Error.')
    })

  } else resError(res, 'Error.') // wrong parameters
})
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
server.listen(port)
