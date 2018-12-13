import { QueryCtrl } from 'app/plugins/sdk';
import './css/query-editor.css!';

/**
 * Datasource query UI controller.
 */
export class GenericDatasourceQueryCtrl extends QueryCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);

    this.scope = $scope;
    this.target.objectId = this.target.objectId || '';
    this.target.metricName = this.target.metricName || '';

    // Object metric suggestion hook.
    // Needs to be defined here as it is called from typeahead.
    this.suggestMetrics = (query, callback) => {
      if (!this.target.objectId) return;

      this.datasource
        .listMetrics(this.target.objectId)
        .then(result => {
          callback(result.data);
        });
    };
  }

  getOptions(query) {
    return this.datasource.metricFindQuery(query || '');
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  metricNameBlur() {
    this.refresh();
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

