'use strict'

const request = require('superagent')
const ethUtil = require('ethereumjs-util')
const cheerio = require('cheerio')
const serverless = require('serverless-http')

const express = require('express')
const app = express()

const utils = require('./lib/Utils')
const db = require('./db')

app.get('/', (req, res) => {
  res.send('Welcome to the Tweedentity API')
})

app.get('/tweeter/:userId', (req, res) => {

  db.get(req.params.userId, (error, result) => {
    if (error) {
      console.log('Error:', error)
      res.status(400).json(error)
    } else {
      res.jsonp(result)
    }
  })
})

app.get('/tweet/:tweetId/:address', (req, res) => {

  function respond(err, val) {
    if (err) console.log('Error', err)
    res.send(val || err)
  }

  const {tweetId, address} = req.params

  if (tweetId && /^\d{18,20}$/.test(tweetId) && /^0x[0-9a-fA-F]{40}$/.test(address)) {

    request
    .get(`https://twitter.com/twitter/status/${tweetId}`)
    .then(tweet => {
      if (tweet.text) {
        const $ = cheerio.load(tweet.text)

        const dataTweet = $('div[data-tweet-id="' + tweetId + '"]')
        const userId = dataTweet.attr('data-user-id')
        const screenName = dataTweet.attr('data-screen-name')
        const name = dataTweet.attr('data-name')

        const data = utils.deconstructTweet($('meta[property="og:description"]').attr('content'))

        const {shortAddr, message, sig, signer, signame, version} = data

        if (version === '1' && shortAddr === address.substring(0, 4) && /^\w+$/.test(userId) && message === `twitter/${userId}@tweedentity` && /^0x[0-9a-f]{130}/.test(sig)) {

          if (utils.verify(address, message, sig, signer, signame)) {
            db.put(userId, screenName, name, address, (err) => {
              if (err) {
                console.log('Error', err)
              }
              respond(null, userId)
            })
          } else respond('wrong-sig') // wrong utils
        } else respond('wrong-tweet') // wrong tweet

      }
    })
    .catch((err) => {
      console.log('Error', err)
      respond('catch-error')
    })
  } else {
    respond('wrong-pars')
  }

})

app.use((req, res) => res.sendStatus(404))

exports.app = app
exports.handler = serverless(app)
