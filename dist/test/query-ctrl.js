'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasourceQueryCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sdk = require('app/plugins/sdk');

require('./css/query-editor.css!');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Datasource query UI controller.
 */
var GenericDatasourceQueryCtrl = exports.GenericDatasourceQueryCtrl = function (_QueryCtrl) {
  _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

  function GenericDatasourceQueryCtrl($scope, $injector) {
    _classCallCheck(this, GenericDatasourceQueryCtrl);

    var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

    _this.scope = $scope;
    _this.target.objectId = _this.target.objectId || '';
    _this.target.metricName = _this.target.metricName || '';
    _this.target.displayPath = _this.target.displayPath || false;

    // Object paths suggestion hook.
    // Needs to be defined here as it is called from typeahead.
    _this.suggestPaths = function (query, callback) {
      _this.datasource.listObjectPaths().then(function (result) {
        // Form path->ID map.
        _this.pathToId = _lodash2.default.reduce(result, function (memo, item) {
          memo[item.path] = item.id;

          return memo;
        }, {});

        callback(_lodash2.default.map(result, function (item) {
          return item.path;
        }));
      });
    };

    // Object metric suggestion hook.
    // Needs to be defined here as it is called from typeahead.
    _this.suggestMetrics = function (query, callback) {
      if (!_this.target.objectId) return;

      _this.datasource.listMetrics(_this.target.objectId).then(callback);
    };

    _this.loadPath();
    return _this;
  }

  /**
   * Loads path for selected Object.
   */


  _createClass(GenericDatasourceQueryCtrl, [{
    key: 'loadPath',
    value: function loadPath() {
      var _this2 = this;

      if (!this.target.objectId) return;

      this.datasource.fetchObject(this.target.objectId, ['path']).then(function (result) {
        _this2.objectPath = result.path;
      }).catch(function (err) {
        // Ignore 404 "Not Found" error as user can input anything as Object ID.
        if (err.status != 404) throw err;
      });
    }
  }, {
    key: 'onChangeInternal',
    value: function onChangeInternal() {
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }

    /**
     * Called when user leaves Object ID input field.
     */

  }, {
    key: 'onObjectIdBlur',
    value: function onObjectIdBlur() {
      this.target.objectId = this.pathToId && this.pathToId[this.target.objectId] || this.target.objectId;

      this.loadPath();
    }
  }]);

  return GenericDatasourceQueryCtrl;
}(_sdk.QueryCtrl);

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
//# sourceMappingURL=query-ctrl.js.map
