var articles = __dirname + '/../articles',
  static = __dirname + '/../static',
  fs = require('fs'),
  markdown = require('markdown').markdown,
  internals = {
    hasTwits: false,
    hasRss: false,
    _feed: undefined,
    _twits: undefined
  }

internals.urlify = function (text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, function (url) {
    return '<a target="_blank" href="' + url + '">' + url + '</a>'
  })
}

internals.getTwits = function (config) {
  var twitter = require('twitter'),
    util = require('util')

  if (!internals.hasTwits) {
    var twit = new twitter({
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      access_token_key: config.access_token_key,
      access_token_secret: config.access_token_secret,
    })

    twit.get('/statuses/user_timeline.json', {
      include_entities: false
    }, function (data) {
      var results = ['<ul>']
      data.forEach(function (entry) {
        results.push("<li class='row top10 twit twit_content'>" + internals.urlify(entry.text) + "</li>")
      })
      results.push('</ul>')
      internals._twits = results.join('')
    })

    setInterval(function () {


      twit.get('/statuses/user_timeline.json', {
        include_entities: false
      }, function (data) {
        var results = ['<ul>']
        data.forEach(function (entry) {
          results.push("<li class='row top10 twit twit_content'>" + internals.urlify(entry.text) + "</li>")
        })
        results.push('</ul>')
        internals._twits = results.join('')
      })
    }, config.twitter_update_delay)
  }

  internals.hasTwits = true

  return this._twits
}


internals.normalizeMixedDataValue = function (value) {

  var padding = "000000000000000"

  // Loop over all numeric values in the string and
  // replace them with a value of a fixed-width for
  // both leading (integer) and trailing (decimal)
  // padded zeroes.
  value = value.replace(
    /(\d+)((\.\d+)+)?/g,
    function ($0, integer, decimal, $3) {

      // If this numeric value has "multiple"
      // decimal portions, then the complexity
      // is too high for this simple approach -
      // just return the padded integer.
      if (decimal !== $3) {

        return (
          padding.slice(integer.length) +
          integer +
          decimal
        )

      }

      decimal = (decimal || ".0")

      return (
        padding.slice(integer.length) +
        integer +
        decimal +
        padding.slice(decimal.length)
      )

    }
  )

  return (value)

}

internals.feed = function (c) {
  var RSS = require('rss')
  this._feed = new RSS({
    title: c.sitename,
    description: c.description,
    feed_url: c.url + '/rss',
    site_url: c.url,
    image_url: c.image,
    //docs: 'http://example.com/rss/docs.html',
    author: c.author,
    managingEditor: c.author,
    webMaster: c.author,
    copyright: c.copyright,
    language: 'fr',
    categories: c.categories,
    //pubDate: new Date().toUTCDate(),
    ttl: '60'
  })
}

internals.addItems = function (config) {
  fs.readdir(articles, function (err, files) {
    if (err) {
      res.view('error', {
        title: 'Unable to read directory!',
        settings: config
      })
    } else {
      var titles = {}
      files.sort(function (a, b) {
        var aMixed = internals.normalizeMixedDataValue(a)
        var bMixed = internals.normalizeMixedDataValue(b)

        return (bMixed < aMixed ? -1 : 1)
      })
      for (var i = 0; i < files.length; i++) {
        var each = files[i]
        var article = articles + '/' + each
        var data = fs.readFileSync(article, 'utf-8')
        var array = data.toString().split("\n\n")
        var parsed = JSON.parse(array[0])
        parsed.url = config.url + "/" + parsed.date + "/" + parsed.slug
        parsed.author = config.author
        parsed.description = config.description
        parsed.categories = config.categories
        internals.addItem(parsed)
      }

    }
  })
}

internals.addItem = function (data, config) {
  this._feed.item({
    title: data.title,
    description: data.description || '',
    url: 'http://example.com/article4?this&that', // link to the item
    categories: data.categories || ['IT'], // optional - array of item categories
    author: data.author, // optional - defaults to feed author property
    date: data.date, // any format that js Date can parse.
    // enclosure: {
    //   url: '...',
    //   file: 'path-to-file'
    // } // optional enclosure
  })


}

internals.getRss = function (config) {
  if (!this.hasRss) {
    internals.feed(config)
    internals.addItems(config)

    setInterval(function () {

    }, config.rss_update_delay)
  }

  this.hasRss = true

  return this._feed.xml()
}

exports.index = function (req, res) {
  var config = this.config

  fs.readdir(articles, function (err, files) {
    if (err) {
      res.view('error', {
        title: 'Unable to read directory!',
        settings: config
      })
    } else {
      var titles = {}
      files.sort(function (a, b) {
        var aMixed = internals.normalizeMixedDataValue(a)
        var bMixed = internals.normalizeMixedDataValue(b)

        return (bMixed < aMixed ? -1 : 1)
      })
      for (var i = 0; i < files.length; i++) {
        var each = files[i]
        var article = articles + '/' + each
        var data = fs.readFileSync(article, 'utf-8')
        var array = data.toString().split("\n\n")
        var parsed = JSON.parse(array[0])
        titles[parsed.date + "/" + parsed.slug] = parsed
      }
      res.view('index', {
        title: 'Home',
        titles: titles,
        settings: config
      })
    }
  })
}

exports.notFound = function (req, res) {
  res.view('error', {}).code(404)
}

exports.rss = function (req, res) {
  res(internals.getRss(this.config)).type('text/xml')
}


exports.twits = function (req, res) {
  res(internals.getTwits(this.config))
}


exports.page = function (req, res) {
  var config = this.config

  var page = static + '/' + req.params.page + '.txt'
  fs.readFile(page, 'utf-8', function (err, data) {
    if (err) {
      res.view('error', {
        title: '404',
        settings: settings
      })
    } else {
      var doc = data.toString().split("\n\n")
      var parsed = JSON.parse(doc[0])
      var output = ""
      for (var i = 1; i < doc.length; i++) {
        output += markdown.toHTML(doc[i])
      }
      res.view(parsed.template, {
        title: parsed.title,
        body: output,
        settings: config
      })
    }
  })
}

exports.article = function (req, res) {
  var config = this.config,
    article = articles + '/' + req.params.year + '-' + req.params.month + '-' + req.params.day + '-' + req.params.article + '.txt'
  fs.readFile(article, 'utf-8', function (err, data) {
    if (err) {
      res.view('error', {
        title: '404',
        settings: settings
      })
    } else {
      var doc = data.toString().split("\n\n")
      var parsed = JSON.parse(doc[0])
      var output = ""
      for (var i = 1; i < doc.length; i++) {
        output += markdown.toHTML(doc[i])
      }
      res.view('article', {
        title: parsed.title,
        body: output,
        settings: config,
        meta: parsed
      })
    }
  })
}


exports.archive = function (req, res) {
  var config = this.config
  fs.readdir(articles, function (err, files) {
    if (err) {
      res.view('error', {
        title: 'Unable to read directory!',
        settings: config
      })
    } else {
      var titles = {}
      var title = ""
      for (var i = 0; i < files.length; i++) {
        var each = files[i]
        var article = articles + '/' + each
        var data = fs.readFileSync(article, 'utf-8')
        var array = data.toString().split("\n\n")
        var parsed = JSON.parse(array[0])
        var date = parsed.date.split("/")
        if (req.params.day) {
          if (date[0] === req.params.year && date[1] === req.params.month && date[2] === req.params.day) {
            titles[parsed.date + "/" + parsed.slug] = parsed
          }
          title = req.params.day + "/" + req.params.month + "/" + req.params.year + " Archive"
        } else if (req.params.month) {
          if (date[0] === req.params.year && date[1] === req.params.month) {
            titles[parsed.date + "/" + parsed.slug] = parsed
          }
          title = req.params.month + "/" + req.params.year + " Archive"
        } else {
          if (date[0] === req.params.year) {
            titles[parsed.date + "/" + parsed.slug] = parsed
          }
          title = req.params.year + " Archive"
        }
      }
      res.view('index', {
        title: title,
        titles: titles,
        settings: config
      })
    }
  })
}