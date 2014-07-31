function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, function (url) {
    return '<a target="_blank" href="' + url + '">' + url + '</a>'
  })
}

var getTwitter = function (config) {
  var twitter = require('twitter'),
    util = require('util')

  var twit = new twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
  })

  if (!module.parent) {
    twit.get('/statuses/user_timeline.json', {
        include_entities: false
      },
      function (data) {
        var results = ['<ul>']
        data.forEach(function (entry) {
          results.push("<li class='row top10 twit twit_content'>" + urlify(entry.text) + "</li>")
        })
        results.push('</ul>')
        global.twits = results.join('')
      })
    setInterval(function () {
      //require('../logger').info('Twits updated')
      twit.get('/statuses/user_timeline.json', {
          include_entities: false
        },
        function (data) {
          var results = ['<ul>']
          data.forEach(function (entry) {
            results.push("<li class='row top10 twit twit_content'>" + urlify(entry.text) + "</li>")
          })
          results.push('</ul>')
          global.twits = results.join('')
        })
    }, config.twitter_update_delay)
  }

  module.parent = true
}



module.exports = getTwitter
module.parent = false