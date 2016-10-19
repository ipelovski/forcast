var http = require('http');
var Arrow = require('arrow');
var request = require('request');

var ipware = require('ipware')();

var ipInfoUrl = 'http://ipinfo.io/';
var forcastBaseUrl = 'http://api.openweathermap.org/' +
  'data/2.5/forecast?units=metric&lang=bg&type=accurate&appid=';
var forcastApiId = '106c8f46bb6cd322faf55e637484931e';
var forcastUrl = forcastBaseUrl + forcastApiId;

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
  // before: false,//'formatRequestBlock',
  // after: false,//['cachingBlock', 'analyticsBlock'],
  parameters: {
    city: {
      description: 'Specifies the target city for the forcast.',
      optional: true
    }
  },
  action: function (req, res, next) {
    var city = req.params.city;
    if (city !== undefined && city !== '') {
      getForcast(city);
    }
    else {
      getIpAddress();
    }
    
    function getForcast(city) {
      var url = forcastUrl + '&q=' + city;
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
    function getIpAddress() {
      var ipInfo = ipware.get_ip(req);
      var url = ipInfoUrl;
      if (ipInfo.clientIpRoutable) {
        url += ipInfo.clientIp;
      }
      request(url, function(error, response, body) {
        if (error) {
          return next(error);
        }
        var info = JSON.parse(body);
        var city = info.city + ',' + info.country;
        getForcast(city);
      });
    }
  }
});

module.exports = forcast5;