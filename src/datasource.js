import _ from 'lodash';

/**
 * Datasource plugin logic implementation.
 */
export class GenericDatasource {
  constructor(instanceSettings, $q, backendSrv, templateSrv) {
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
   * test request to the datasource.
   *
   * @returns {*} Datasource response promise.
   */
  testDatasource() {
    return this
      .doRequest({
        url: this.url + '/node/api/tags',
        method: 'GET'
      })
      .then(response => {
        if (response.status === 200) {
          return { status: 'success', message: 'Data source is working', title: 'Success' };
        }
      });
  }

  query(options) {
    const query = this.buildQueryParameters(options);

    if (query.length <= 0) {
      return this.q.when({ data: [] });
    }

    if (query.length > 1) throw new Error('Multiple queries are not supported yet.');

    const query0 = query[0];

    return this
      .doRequest({
        url: `${this.url}/node/api/objects/${query0.objectId}/history?from=1h-ago&metrics=${query0.metricName}`,
        method: 'GET'
      })
      .then(response => {
        const data = _.map(response.data, metricData => {
          return {
            target: `${query0.objectId}:${query0.metricName}`,
            datapoints: _.map(metricData.dps, dp => dp.reverse())
          };
        });

        return { data };
      });
  }

  annotationQuery(options) {
    const query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    const annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    const interpolated = {
      target: this.templateSrv.replace(query, null, 'regex')
    };

    return this.doRequest({
      url: this.url + '/search',
      data: interpolated,
      method: 'POST'
    }).then(this.mapToTextValue);
  }

  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      }
      else if (_.isObject(d)) {
        return { text: d, value: i };
      }

      return { text: d, value: d };
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    return _.filter(options.targets, target => target.objectId && target.metricName && !target.hide);
  }

  getTagKeys(options) {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/tag-keys',
        method: 'POST',
        data: options
      }).then(result => {
        return resolve(result.data);
      });
    });
  }

  getTagValues(options) {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/tag-values',
        method: 'POST',
        data: options
      }).then(result => {
        return resolve(result.data);
      });
    });
  }
}
