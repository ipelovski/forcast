'use strict';

(function () {
  var baseUrl = '/forcast5';
  var secondsInDay = 24 * 60 * 60;
  var httpRequest;
  document.addEventListener('DOMContentLoaded', function (e) {
    document.getElementById('search')
      .addEventListener('click', search);
    document.getElementById('city')
      .addEventListener('keypress', function (e) {
        if (e.keyCode === 13) {
          search();
        }
      });
  });
  loadForcast();

  function search() {
    var city = document.getElementById('city').value;
    window.location.hash = city;
    loadForcast();
  }
  
  function render(forcast) {
    var template = document.getElementById('template').innerHTML;
    document.getElementById('content').innerHTML =
      ejs.render(template, {forcast: forcast});
  }
  
  function transform(forcast) {
    forcast.data = forcast.data.reduce(function (groups, item) {
      var key = new Date(item.time * 1000).toDateString();
      var group = groups.find(function (group) {
        return group.key === key;
      });
      if (group === undefined) {
        group = {
          key: key,
          day: item.time,
          data: []
        };
        groups.push(group);
      }
      group.data.push(item);
      return groups;
    }, []);
    return forcast;
  }
  
  function loadForcast() {
    function getForcastFromGeoLocation(initial) {
      if (initial) {
        getForcast();
      }
      navigator.geolocation.getCurrentPosition(
        function (position) {
          getForcast({
            coords: position.coords
          });
        }, function () {
          if (!initial) {
            getForcast();
          }
        });
    }
    if (location.hash !== '' && location.hash !== '#') {
      var city = location.hash.substring(1);
      getForcast({
        city: city
      });
    }
    else {
      if ('permissions' in navigator) {
        navigator.permissions.query({name:'geolocation'})
          .then(function(result) {
            if (result.state == 'granted') {
              getForcastFromGeoLocation(false);
            }
            else if (result.state == 'prompt') {
              getForcastFromGeoLocation(true);
            }
            else {
              getForcast();
            }
          });
      }
      else if ('geolocation' in navigator) {        
        getForcastFromGeoLocation(true);
      } else {
        getForcast();
      }
    }
  }

  function getForcast(options) {
    options = options != null ? options : {};
    var params = '';
    if (options.coords != null) {
      params = 'lat=' + options.coords.latitude +
        '&lon=' + options.coords.longitude;
    }
    else if (options.city != null && options.city !== '') {
      params = 'city=' + options.city;
    }
    makeRequest(params);
  }
  
  function makeRequest(params) {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = dataLoaded;
    httpRequest.open('GET', baseUrl + '?' + params);
    httpRequest.send();
  }

  function dataLoaded() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      var forcast;
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        forcast = transform(data);
      }
      else {
        forcast = {
          city: {
            name: 'N/A',
            country: 'N/A'
          },
          data: [],
          minTemp: 'N/A',
          maxTemp: 'N/A'
        };
      }
      render(forcast);
    }
  }
}());