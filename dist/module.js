'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotationsQueryCtrl = exports.QueryOptionsCtrl = exports.ConfigCtrl = exports.QueryCtrl = exports.Datasource = undefined;

var _datasource = require('./datasource');

var _queryCtrl = require('./query-ctrl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Generic query UI controller.
 */
var GenericConfigCtrl = function GenericConfigCtrl() {
  _classCallCheck(this, GenericConfigCtrl);
};

GenericConfigCtrl.templateUrl = 'partials/config.html';

/**
 * Generic query options UI controller.
 */

var GenericQueryOptionsCtrl = function GenericQueryOptionsCtrl() {
  _classCallCheck(this, GenericQueryOptionsCtrl);
};

GenericQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

/**
 * Generic query annotations UI controller.
 */

var GenericAnnotationsQueryCtrl = function GenericAnnotationsQueryCtrl() {
  _classCallCheck(this, GenericAnnotationsQueryCtrl);
};

GenericAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

exports.Datasource = _datasource.GenericDatasource;
exports.QueryCtrl = _queryCtrl.GenericDatasourceQueryCtrl;
exports.ConfigCtrl = GenericConfigCtrl;
exports.QueryOptionsCtrl = GenericQueryOptionsCtrl;
exports.AnnotationsQueryCtrl = GenericAnnotationsQueryCtrl;
//# sourceMappingURL=module.js.map
