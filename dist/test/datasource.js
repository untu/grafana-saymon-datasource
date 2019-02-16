'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _datemath = require('app/core/utils/datemath');

var dateMath = _interopRequireWildcard(_datemath);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Datasource plugin logic implementation.
 */
var GenericDatasource = exports.GenericDatasource = function () {
  function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    _classCallCheck(this, GenericDatasource);

    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = { 'Content-Type': 'application/json' };

    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  /**
   * Tests that the datasource configuration is correct by sending
   * test request SAYMON instance.
   *
   * @returns {Promise} Datasource response promise.
   */


  _createClass(GenericDatasource, [{
    key: 'testDatasource',
    value: function testDatasource() {
      return this.requestRaw({
        url: this.url + '/node/api/tags',
        method: 'GET'
      }).then(function (response) {
        if (response.status === 200) {
          return { status: 'success', message: 'Data source is working', title: 'Success' };
        }
      });
    }

    /**
     * Fetches metric data using SAYMON history REST method.
     *
     * @param {Object} options Query options.
     * @returns {Promise} Data promise.
     */

  }, {
    key: 'query',
    value: function query(options) {
      var _this = this;

      var start = this.convertToTsdbTime(options.rangeRaw.from, false) || '1h-ago';
      var end = this.convertToTsdbTime(options.rangeRaw.to, true);
      var query = _lodash2.default.chain(options.targets).filter(function (target) {
        return target.objectId && target.metricName && !target.hide;
      }).map(function (target) {
        target.from = start;
        target.to = end;

        return target;
      }).value();

      if (query.length <= 0) {
        return this.q.when({ data: [] });
      }

      var promises = _lodash2.default.map(query, function (row) {
        return _this.fetchMetric(row);
      });

      return Promise.all(promises).then(function (data) {
        return { data: data };
      });
    }

    /**
     * Performs graph annotation query.
     *
     * @param {Object} options Query options.
     */

  }, {
    key: 'annotationQuery',
    value: function annotationQuery(options) {}
    // Not implemented.


    /**
     * Fetches data for single Object-metric pair.
     *
     * @param {Object} query Metric query.
     * @returns {Promise} Metric data promise.
     */

  }, {
    key: 'fetchMetric',
    value: function fetchMetric(query) {
      var url = this.url + '/node/api/objects/' + query.objectId + '/history?from=' + query.from + '&metrics=' + encodeURIComponent(query.metricName);

      if (query.to) {
        url += '&to=' + query.to;
      }

      var nameField = query.displayPath ? 'path' : 'name';

      return Promise.all([this.request({ url: url, method: 'GET' }), this.fetchObject(query.objectId, [nameField])]).then(function (responses) {
        var historyData = responses[0];
        var objectInfo = responses[1];
        var data = historyData[0];

        return {
          target: objectInfo[nameField] + ':' + query.metricName,
          datapoints: data && _lodash2.default.map(data.dps, function (dp) {
            return dp.reverse();
          }) || []
        };
      });
    }

    /**
     * Fetches metric names for a given SAYMON Object.
     *
     * @param {String} objectId SAYMON Object ID.
     * @returns {Promise} Metric name array promise.
     */

  }, {
    key: 'listMetrics',
    value: function listMetrics(objectId) {
      return this.request({
        url: this.url + '/node/api/objects/' + objectId + '/stat/metrics',
        method: 'GET'
      });
    }

    /**
     * Fetches object information for given SAYMON Object.
     *
     * @param {String} objectId Object ID.
     * @param {String[]} [fields] List of object fields to fetch.
     * @returns {Promise} Object information promise.
     */

  }, {
    key: 'fetchObject',
    value: function fetchObject(objectId, fields) {
      return this.request({
        url: this.url + '/node/api/objects/' + objectId + (!_lodash2.default.isEmpty(fields) ? '?fields=' + fields.join(',') : ''),
        method: 'GET'
      });
    }

    /**
     * Fetches full paths for all SAYMON Objects, paired with Object IDs.
     *
     * @returns {Promise} Path list promise.
     */

  }, {
    key: 'listObjectPaths',
    value: function listObjectPaths() {
      return this.request({
        url: this.url + '/node/api/objects?fields=id,path',
        method: 'GET'
      });
    }

    /**
     * Performs request to SAYMON through backend proxy. Returns raw response.
     *
     * @param {Object} options Request options.
     * @returns {Promise} Raw response promise.
     */

  }, {
    key: 'requestRaw',
    value: function requestRaw(options) {
      options.withCredentials = this.withCredentials;
      options.headers = this.headers;

      return this.backendSrv.datasourceRequest(options);
    }

    /**
     * Performs request to SAYMON through backend proxy and checks for response status code.
     * Throws error if status is not 200.
     *
     * @param {Object} options Request options.
     * @returns {Promise} Response body promise.
     */

  }, {
    key: 'request',
    value: function request(options) {
      return this.requestRaw(options).then(function (response) {
        if (response.status != 200) throw new Error('Request ' + options.url + ' failed: ' + response.status);

        return response.data;
      });
    }

    /**
     * Converts date-time to OpenTSDB format, supported by SAYMON.
     *
     * @param {String|Number} date Date-time string or number to convert.
     * @param {Boolean} roundUp Round-up flag.
     * @returns {*} Conversion result.
     */

  }, {
    key: 'convertToTsdbTime',
    value: function convertToTsdbTime(date, roundUp) {
      if (date === 'now') {
        return null;
      }

      date = dateMath.parse(date, roundUp);

      return date.valueOf();
    }
  }]);

  return GenericDatasource;
}();
//# sourceMappingURL=datasource.js.map
