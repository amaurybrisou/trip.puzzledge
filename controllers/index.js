var articles = __dirname + '/../articles';
var static = __dirname + '/../static';
var fs = require('fs'),
  markdown = require('markdown').markdown;



function normalizeMixedDataValue(value) {

  var padding = "000000000000000";

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
        );

      }

      decimal = (decimal || ".0");

      return (
        padding.slice(integer.length) +
        integer +
        decimal +
        padding.slice(decimal.length)
      );

    }
  );

  return (value);

}

exports.add = function (req, res) {
  res.view('add', {
    title: 'Home',
    settings: this.config
  });
}

exports.index = function (req, res) {
  var config = this.config

  fs.readdir(articles, function (err, files) {
    if (err) {
      res.view('error', {
        title: 'Unable to read directory!',
        settings: config
      });
    } else {
      var titles = {};
      files.sort(function (a, b) {
        var aMixed = normalizeMixedDataValue(a);
        var bMixed = normalizeMixedDataValue(b);

        return (bMixed < aMixed ? -1 : 1);
        // return fs.statSync(articles + "/" + b).ctime.getTime() - fs.statSync(articles + "/" + a).ctime.getTime();
      });
      for (var i = 0; i < files.length; i++) {
        var each = files[i];
        var article = articles + '/' + each;
        var data = fs.readFileSync(article, 'utf-8');
        var array = data.toString().split("\n\n");
        var parsed = JSON.parse(array[0]);
        titles[parsed.date + "/" + parsed.slug] = parsed;
      }
      res.view('index', {
        title: 'Home',
        titles: titles,
        settings: config
      });
    }
  });
};


exports.twits = function (req, res) {
  if (global.twits) {
    res(global.twits);
  }
}


exports.page = function (req, res) {
  var config = this.config

  var page = static + '/' + req.params.page + '.txt'
  fs.readFile(page, 'utf-8', function (err, data) {
    if (err) {
      res.view('error', {
        title: '404',
        settings: settings
      });
    } else {
      var doc = data.toString().split("\n\n");
      var parsed = JSON.parse(doc[0]);
      var output = ""
      for (var i = 1; i < doc.length; i++) {
        output += markdown.toHTML(doc[i]);
      }
      res.view(parsed.template, {
        title: parsed.title,
        body: output,
        settings: config
      });
    }
  });
};

exports.article = function (req, res) {
  var config = this.config,
    article = articles + '/' + req.params.year + '-' + req.params.month + '-' + req.params.day + '-' + req.params.article + '.txt'
  fs.readFile(article, 'utf-8', function (err, data) {
    if (err) {
      res.view('error', {
        title: '404',
        settings: settings
      });
    } else {
      var doc = data.toString().split("\n\n");
      var parsed = JSON.parse(doc[0]);
      var output = ""
      for (var i = 1; i < doc.length; i++) {
        output += markdown.toHTML(doc[i]);
      }
      res.view('article', {
        title: parsed.title,
        body: output,
        settings: config,
        meta: parsed
      });
    }
  });
};

exports.notFound = function (req, res) {
  res.view('error', {}).code(404);
}

exports.archive = function (req, res) {
  var config = this.config
  fs.readdir(articles, function (err, files) {
    if (err) {
      res.view('error', {
        title: 'Unable to read directory!',
        settings: config
      });
    } else {
      var titles = {};
      var title = "";
      for (var i = 0; i < files.length; i++) {
        var each = files[i];
        var article = articles + '/' + each;
        var data = fs.readFileSync(article, 'utf-8');
        var array = data.toString().split("\n\n");
        var parsed = JSON.parse(array[0]);
        var date = parsed.date.split("/");
        if (req.params.day) {
          if (date[0] === req.params.year && date[1] === req.params.month && date[2] === req.params.day) {
            titles[parsed.date + "/" + parsed.slug] = parsed;
          }
          title = req.params.day + "/" + req.params.month + "/" + req.params.year + " Archive"
        } else if (req.params.month) {
          if (date[0] === req.params.year && date[1] === req.params.month) {
            titles[parsed.date + "/" + parsed.slug] = parsed;
          }
          title = req.params.month + "/" + req.params.year + " Archive"
        } else {
          if (date[0] === req.params.year) {
            titles[parsed.date + "/" + parsed.slug] = parsed;
          }
          title = req.params.year + " Archive"
        }
      }
      res.view('index', {
        title: title,
        titles: titles,
        settings: config
      });
    }
  });
};