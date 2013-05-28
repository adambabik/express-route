'use strict';

/*
	Example of a file with routes configuration.
 */

module.exports = {

	// simple route

	'/': function (req, res) {
		res.end('index');
	},

	// route with restricted option

	'/user': {
		fn: function (req, res) {
			res.end('user');
		},
		restricted: true
	},

	// route that accepts several methods

	'/user/posts/:id': {
		fn: function (req, res) {
			res.end('method ' + req.method + ' post #' + req.params.id);
		},
		restricted: true,
		methods: ['get', 'post', 'delete']
	}

};
