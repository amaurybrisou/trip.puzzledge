exports.register = function (plugin, options, next) {
  var path = process.env.puzzledge_trip = __dirname

  // var t = new require(path + '/controllers/getTwitter');
  // new t(options);

  plugin.views({
    engines: {
      jade: require('jade')
    },
    path: path + '/views/'
  })

  plugin.bind({
    config: options
  })

  plugin.route(require(path + '/routes'))

  next()
}

exports.register.attributes = {
  name: 'trip.puzzledge.eu',
  version: '0.0.1',
  pkg: require('./package.json')
}