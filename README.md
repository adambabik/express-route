# express-route

express-route is a library that let you organize the routes for the express applications.

## Usage

### Setting up routes

```javascript
var route = require('express-route');

// app is a reference to an express application
// './routes' is a path to the directory with routes
// the third parameter is a configuration object
route(app, './routes', {
	// retrieve routes synchronously
	sync: true,

	// action to invoke when route is marked as restricted: true
	ensureRestriction: function (req, res, next) {
		if (!user.authorized) {
			res.status(403).end('Forbidden');
			return;
		}
		next();
	}
});
```

More examples you can find in the tests directory.

### Configuring routes

```javascript
module.exports = {

	// simple route

	'/': function (req, res) {
		res.end('index');
	},

	// route with restricted setting on

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
```
