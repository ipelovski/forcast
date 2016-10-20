var http = require('http');
var Arrow = require('arrow');
var request = require('request');

var forcastBaseUrl = 'http://api.openweathermap.org/' +
  'data/2.5/forecast?units=metric&lang=bg&type=accurate&appid=';

function transform(body) {
  var value = JSON.parse(body);
  return {
    city: {
      name: value.city.name,
      country: value.city.country
    },
    data: value.list.map(function (item) {
      var weather = item.weather[0];
      return {
        time: item.dt,
        temp: item.main.temp,
        humidity: item.main.humidity,
        description: weather.description,
        icon: weather.icon,
        windSpeed: item.wind.speed,
        windDegrees: item.wind.deg,
        clouds: item.clouds.all
      };
    })
  };
}

var forcast5 = Arrow.API.extend({
  group: 'forcast5',
  path: '/api/forcast5/:city',
  nickname: '/api/forcast5',
  method: 'GET',
  description: 'Rertrives a 5 days forcast. Renews every 3 hours.',
  parameters: {
    city: {
      description: 'Specifies the target city for the forcast.',
      optional: true
    },
    lat: {
      description: 'Specifies the latitude of the location for the forcast.',
      optional: true
    },
    lon: {
      description: 'Specifies the longitude of the location for the forcast.',
      optional: true
    }
  },
  action: function (req, res, next) {
    var config = req.server.config;
    var forcastUrl = forcastBaseUrl + config.forcastApiId;
    var lat = req.params.lat;
    var lon = req.params.lon;
    var city = req.params.city;
    if (lat != null && lon != null) {
      getForcastByLocation(lat, lon);
    }
    else {
      if (city == null || city === '') {
        city = config.defaultCity;
      }
      getForcastByCity(city);
    }

    function requestForcast(url) {
      request(url, function (error, response, body) {
        if (error) {
          return next(error);
        }
        if (response.statusCode !== 200) {
          return next(new Error(body));
        }
        var forcast = transform(body);
        res.send(forcast);
        next();
      });
    }
    function getForcastByLocation(lat, lon) {
      var url = forcastUrl + '&lat=' + lat + '&lon=' + lon;
      requestForcast(url);
    }
    function getForcastByCity(city) {
      var url = forcastUrl + '&q=' + city;
      requestForcast(url);
    }
  }
});

module.exports = forcast5;