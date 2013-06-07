'use strict';

var Router = require('./lib/router');

/**
 * Router factory.
 * @param  {Object} app            Express application
 * @param  {String} dir            Path to directory or file with routes configuration
 * @param  {Object|null}           settings
 * @return {Object<Router>}        Router instance
 */
function route(app, dir, settings) {
  var router = new Router(app, dir, settings);
  router.readdirWithRoutes(dir);
  return router;
}

/** @type {Function} Router constructor. */
route.Router = Router;

module.exports = route;
