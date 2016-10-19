var http = require('http');
var Arrow = require('arrow');

var forcastBaseUrl = 'http://api.openweathermap.org/data/2.5/forecast?q=Sofia,BG&units=metric&lang=bg&appid=';
var forcastApiId = '106c8f46bb6cd322faf55e637484931e';

function transform(body) {
  var value = JSON.parse(body);
  ne raboti
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
      description: 'Specifies the target city for the forcast.'
    }
  },
  action: function (req, res, next) {
    function callback(forcastResponse) {
      var chunks = [];
      forcastResponse
        .on('data', function (chunk) {
          chunks.push(chunk);
        })
        .on('end', function () {
          var body = Buffer.concat(chunks).toString();
          var forcast = transform(body);
          res.send(forcast);
          next();
        })
        .on('error', function (e) {
          next(e);
        });
    }
    var forcastRequest = http.get(forcastBaseUrl + forcastApiId, callback)
      .on('error', function (e) {
        next(e);
      });
  }
});

module.exports = forcast5;