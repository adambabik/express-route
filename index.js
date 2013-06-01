'use strict';

var fs   = require('fs'),
    path = require('path');

/**
 * Function which always return true.
 * @return {Boolean} returned value is always true
 */
function returnTrue() { return true; }

/**
 * Assert an extension of a file path.
 * @param  {String} p   path
 * @param  {String} ext file extension
 * @return {Boolean}    return whether path has the ext extension
 */
function assertExt(p, ext) {
  return path.extname(p) === ext;
}

/**
 * Router
 * @param {Object} app      reference to express application
 * @param {String} dirPath  path to file or directory with route configuration files
 * @param {Object} settings
 */
function Router(app, dirPath, settings) {
  if (!app) {
    throw new Error('The first parameter must be an express application.');
  }

  settings || (settings = {});

  if (typeof settings.ensureRestriction !== 'function') {
    settings.ensureRestriction = returnTrue;
  }

  if (!Array.isArray(settings.ext)) {
    if (settings.ext) {
      settings.ext = [settings.ext];
    } else {
      settings.ext = ['.js'];
    }
  }

  if (typeof settings.sync !== 'boolean') {
    settings.sync = true;
  }

  this.app = app;
  this.dirPath = dirPath;
  this.settings = settings;
}

var proto = Router.prototype;

/**
 * Adapter statSync -> stat
 * @param  {String}   path
 * @param  {Function} fn
 */
function statSync(path, fn) {
  var stats = fs.statSync(path);
  fn(null, stats);
}

/**
 * Adapter readdirSync -> readdir
 * @param  {String}   path
 * @param  {Function} fn
 */
function readdirSync(path, fn) {
  var files = fs.readdirSync(path);
  fn(null, files);
}

/**
 * Read and require all routes from dirPath.
 * DirPath can be a path to file.
 * @param  {String} dirPath
 */
proto.readdirWithRoutes = function readdirWithRoutes(dirPath) {
  var _self = this,
      sync = _self.settings.sync;

  var stat = sync ? statSync : fs.stat,
      readdir = sync ? readdirSync : fs.readdir;

  stat(dirPath, function (err, stats) {
    if (err) {
      throw err;
    }

    if (stats.isDirectory()) {
      readdir(dirPath, function (err, files) {
        if (err) throw err;

        files.forEach(function (file) {
          stat(path.join(dirPath, file), function (err, stats) {
            if (err) throw err;

            if (stats.isDirectory()) {
              _self.readdirWithRoutes(path.resolve(dirPath, file));
            } else if (_self.settings.ext.some(function (ext) { return assertExt(file, ext); })) {
              _self.applyRoutes(require(path.resolve('./', dirPath, file)));
            }
          });
        });
      });
    } else {
      _self.applyRoutes(require(path.resolve('./', dirPath)));
    }
  });
};

/**
 * Apply obtained routes to the express application.
 * @param  {Object} routes
 */
proto.applyRoutes = function applyRoutes(routes) {
  var _self = this,
      action, actionName, methods, route;

  for (actionName in routes) {
    if (!routes.hasOwnProperty(actionName)) continue;

    action = routes[actionName];

    if (Array.isArray(action)) {
      action.forEach(function (route) {
        _self.applyRoute(actionName, route);
      });
    } else {
      _self.applyRoute(actionName, action);
    }
  }
};

/**
 * Apply single action to the express application.
 * @param  {String}          actionName route path
 * @param  {Function|Object} action     route definition
 */
proto.applyRoute = function applyRoute(actionName, action) {
  var _self = this, methods;

  if (typeof action === 'function') {
    _self.app.get(actionName, action);
  } else if (typeof action.fn === 'function') {
    methods = action.methods && Array.isArray(action.methods) ?
              action.methods :
              ['get'];

    methods.forEach(function (method) {
      if (action.restricted) {
        _self.app[method](actionName, _self.settings.ensureRestriction, action.fn);
      } else if (action) {
        _self.app[method](actionName, action.fn);
      }
    });
  } else {
    throw new Error('Wrong definition of the route. It must be a function or a object with `fn` property.');
  }
};

/**
 * Router factory.
 * @param  {Object} app            Express application
 * @param  {String} dir            Path to directory or file with routes configuration
 * @param  {Object|null}           settings
 * @return {Object<Router>}        Router instance
 */
function route(app, dir, settings) {
  return new Router(app, dir, settings).readdirWithRoutes(dir);
}
route.Router = Router;

module.exports = route;
