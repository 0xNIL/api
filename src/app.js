const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rfs = require('rotating-file-stream')
const api = require('./routes/api')
const fs = require('./lib/fs')
const Logger = require('./lib/Logger')
const constants = require('./constants')

process.on('uncaughtException', function (error) {

  Logger.error(error.message)
  Logger.error(error.stack)

  // if(!error.isOperational)
  //   process.exit(1)
})

const app = express()

const logDirectory = '/var/log/tweedentity'
fs.ensureDirSync(logDirectory)
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})
app.use(morgan('combined', {stream: accessLogStream}))

app.use(cookieParser())

app.use('/api/v1', api)

app.use('/', (req, res) => {
  res.send(`<html>
<head><script>
var aliases = 'www.tweedentity.com,api.tweedentity.com'.split(',')

if (~aliases.indexOf(location.hostname)) {
    location = location.href.replace(/http:/, 'https:').replace(RegExp(location.hostname), 'tweedentity.com')
} else if (location.hostname === '.tweedentity.com' && location.protocol === 'http:') {
    location = location.href.replace(/http:/, 'https:')
}
</script></head>
<body><div>${constants.WELCOME_MESSAGE}</div>
</body></html>`)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
      title: 'Error',
      message: err.message,
      error: process.env.DEBUG_MODE ? err : ''
    })
  })
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    error: true
  })
})

module.exports = app
