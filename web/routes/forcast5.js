var Arrow = require('arrow');

var secondsInDay = 24 * 60 * 60;

function transform(value) {
	var forcast = {
		city: value.city,
		minTemp: value.data.reduce(function (min, item) {
			return Math.min(min, item.temp);
		}, Number.MAX_VALUE),
		maxTemp: value.data.reduce(function (max, item) {
			return Math.max(max, item.temp);
		}, Number.MIN_VALUE),
		data: value.data.reduce(function (groups, item) {
			var day = Math.floor(item.time / secondsInDay) * secondsInDay;
			var group = groups.find(function (group) {
				return group.day === day;
			});
			if (group === undefined) {
				group = {
					day: day,
					data: []
				};
				groups.push(group);
			}
			group.data.push(item);
			return groups;
		}, [])
	};
	return forcast;
}

var forcast5Route = Arrow.Router.extend({
	name: 'forcast5',
	path: '/forcast5',
	method: 'GET',
	description: 'Shows the forcast for the next 5 days for a given city.',
	action: function (req, resp, next) {
		/**
		 * by default, routes are sync. to make them async, add a next in the action above as
		 * the last parameter and then call next when completed
		 */
	 	function render(err, results) {
	 		if (err) {
	 			return next(err);
	 		}
	 		var forcast = results;
			resp.render('forcast5', {
				forcast: transform(forcast)
			}, next);
		}
		req.server.getAPI('/api/forcast5', 'GET').execute({
			city: 'aaa'
		}, render);
	}
});

module.exports = forcast5Route;