import { QueryCtrl } from 'app/plugins/sdk';
import './css/query-editor.css!';
import _ from 'lodash';

/**
 * Datasource query UI controller.
 */
export class GenericDatasourceQueryCtrl extends QueryCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);

    this.scope = $scope;
    this.target.objectId = this.target.objectId || '';
    this.target.metricName = this.target.metricName || '';
    this.target.displayPath = this.target.displayPath || false;

    // Object paths suggestion hook.
    // Needs to be defined here as it is called from typeahead.
    this.suggestPaths = (query, callback) => {
      this.datasource
        .listObjectPaths()
        .then(result => {
          // Form path->ID map.
          this.pathToId = _.reduce(result, (memo, item) => {
            memo[item.path] = item.id;

            return memo;
          }, {});

          callback(_.map(result, item => item.path));
        });
    };

    // Object metric suggestion hook.
    // Needs to be defined here as it is called from typeahead.
    this.suggestMetrics = (query, callback) => {
      if (!this.target.objectId) return;

      this.datasource
        .listMetrics(this.target.objectId)
        .then(callback);
    };

    this.loadPath();
  }

  /**
   * Loads path for selected Object.
   */
  loadPath() {
    if (!this.target.objectId) return;

    this.datasource
      .fetchObject(this.target.objectId, ['path'])
      .then(result => {
        this.objectPath = result.path;
      });
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  /**
   * Called when user leaves Object ID input field.
   */
  onObjectIdBlur() {
    this.target.objectId = this.pathToId && this.pathToId[this.target.objectId] || this.target.objectId;

    this.loadPath();
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

