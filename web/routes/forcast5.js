var Arrow = require('arrow');

function transform(forcast) {
	forcast.minTemp = forcast.data.reduce(function (min, item) {
		return Math.min(min, item.temp);
	}, Number.MAX_VALUE);
	forcast.maxTemp = forcast.data.reduce(function (max, item) {
		return Math.max(max, item.temp);
	}, Number.MIN_VALUE);
	return forcast;
}

var forcast5Route = Arrow.Router.extend({
	name: 'forcast5',
	path: '/forcast5',
	method: 'GET',
	description: 'Shows the forcast for the next 5 days for a given city.',
	action: function (req, resp, next) {
	 	function render(err, results) {
	 		if (err) {
	 			console.error(err);
	 			return resp.send({
					city: {
						name: 'N/A',
						country: 'N/A'
					},
					data: [],
					minTemp: 'N/A',
					maxTemp: 'N/A'
				});
	 		}
	 		var forcast = results;
			resp.send(transform(forcast));
			next();
		}
		req.server.getAPI('/api/forcast5', 'GET').execute({
			city: req.query.city,
			lat: req.query.lat,
			lon: req.query.lon
		}, render);
	}
});

module.exports = forcast5Route;