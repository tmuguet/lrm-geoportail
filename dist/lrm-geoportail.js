(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Gp = (typeof window !== "undefined" ? window['Gp'] : typeof global !== "undefined" ? global['Gp'] : null);

if (L.Routing === undefined) {
  L.Routing = {};
}

L.Routing.GeoPortail = L.Evented.extend({
  options: {
    profile: 'Voiture' // Or 'Pieton'

  },
  initialize: function initialize(apiKey, options) {
    this._apiKey = apiKey;
    L.Util.setOptions(this, options);
  },
  route: function route(waypoints, callback, context) {
    var _this = this;

    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    // Merge the options so we get options defined at L.Routing.GeoPortail creation
    var _options = this.options;
    var optionsKeys = Object.keys(options);

    for (var i = 0; i < optionsKeys.length; i += 1) {
      var attrname = optionsKeys[i];
      _options[attrname] = options[attrname];
    }

    var wps = [];

    for (var _i = 0; _i < waypoints.length; _i += 1) {
      var wp = waypoints[_i];
      wps.push({
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options
      });
    }

    var routeOpts = this.buildRouteOpts(wps, _options);

    routeOpts.onSuccess = function (results) {
      _this._handleGeoPortailSuccess(results, wps, callback, context);
    };

    routeOpts.onFailure = function (error) {
      _this._handleGeoPortailError(error, callback, context);
    };

    Gp.Services.route(routeOpts);
    return this;
  },
  _handleGeoPortailSuccess: function _handleGeoPortailSuccess(results, wps, callback, context) {
    var ctx = context || callback;
    var coordinates = [];
    var instructions = [];

    for (var i = 0; i < results.routeInstructions.length; i += 1) {
      var instruction = results.routeInstructions[i];
      instructions.push({
        type: this._instructionToType(instruction),
        text: instruction.instruction,
        distance: instruction.distance,
        time: instruction.duration,
        index: coordinates.length
      });

      for (var j = 0; j < instruction.geometry.coordinates.length; j += 1) {
        var coords = instruction.geometry.coordinates[j];
        coordinates.push(L.latLng(coords[1], coords[0]));
      }
    }

    var alt = {
      name: '',
      coordinates: coordinates,
      instructions: instructions,
      summary: {
        totalDistance: results.totalDistance,
        totalTime: results.totalTime,
        // TODO: unit?
        totalAscend: 0 // unsupported?

      },
      inputWaypoints: wps,
      actualWaypoints: [{
        latLng: coordinates[0],
        name: wps[0].name
      }, {
        latLng: coordinates[coordinates.length - 1],
        name: wps[wps.length - 1].name
      }],
      waypointIndices: [0, coordinates.length - 1]
    };
    callback.call(ctx, null, [alt]);
  },
  _handleGeoPortailError: function _handleGeoPortailError(error, callback, context) {
    callback.call(context || callback, {
      status: -1,
      message: "GeoPortail route failed: ".concat(error),
      response: null
    });
  },
  buildRouteOpts: function buildRouteOpts(waypoints, options) {
    var wps = [];
    var i;

    for (i = 0; i < waypoints.length; i += 1) {
      var wp = waypoints[i];
      wps.push({
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options
      });
    }

    var startLatLng = wps.shift().latLng;
    var endLatLng = wps.pop().latLng;
    var viaPoints = [];

    for (i = 0; i < wps.length; i += 1) {
      var viaPoint = wps[i].latLng;
      viaPoints.push({
        x: viaPoint.lng,
        y: viaPoint.lat
      });
    }

    var opt = {
      distanceUnit: 'm',
      endPoint: {
        x: endLatLng.lng,
        y: endLatLng.lat
      },
      exclusions: [],
      geometryInInstructions: true,
      graph: options.profile,
      routePreferences: 'fastest',
      startPoint: {
        x: startLatLng.lng,
        y: startLatLng.lat
      },
      viaPoints: viaPoints,
      apiKey: this._apiKey
    };
    return opt;
  },
  _instructionToType: function _instructionToType(instruction) {
    switch (instruction.code) {
      case 'BL':
        return 'SharpLeft';

      case 'L':
        return 'Left';

      case 'R':
        return 'Right';

      default:
        return '';
    }
  }
});

L.Routing.geoPortail = function geoPortail(apiKey, options) {
  return new L.Routing.GeoPortail(apiKey, options);
};

module.exports = L.Routing.GeoPortail;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
