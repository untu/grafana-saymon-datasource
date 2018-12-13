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
   * test request SAYMON instance.
   *
   * @returns {Promise} Datasource response promise.
   */
  testDatasource() {
    return this
      .requestRaw({
        url: this.url + '/node/api/tags',
        method: 'GET'
      })
      .then(response => {
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
  query(options) {
    const query = _.filter(options.targets, target => target.objectId && target.metricName && !target.hide);

    if (query.length <= 0) {
      return this.q.when({ data: [] });
    }

    if (query.length > 1) throw new Error('Multiple queries are not supported yet.');

    const query0 = query[0];

    return Promise
      .all([
        this.request({
          url: `${this.url}/node/api/objects/${query0.objectId}/history?from=1h-ago&metrics=${query0.metricName}`,
          method: 'GET'
        }),
        this.fetchObject(query0.objectId)
      ])
      .then(responses => {
        const historyData = responses[0];
        const objectInfo = responses[1];
        const data = _.map(historyData, metricData => {
          return {
            target: `${objectInfo.name}:${query0.metricName}`,
            datapoints: _.map(metricData.dps, dp => dp.reverse())
          };
        });

        return { data };
      });
  }

  /**
   * Performs graph annotation query.
   *
   * @param {Object} options Query options.
   */
  annotationQuery(options) {
    // Not implemented.
  }

  /**
   * Fetches metric names for a given SAYMON Object.
   *
   * @param {String} objectId SAYMON Object ID.
   * @returns {Promise} Metric name array promise.
   */
  listMetrics(objectId) {
    return this.request({
      url: `${this.url}/node/api/objects/${objectId}/stat/metrics`,
      method: 'GET'
    });
  }

  /**
   * Fetches object information for given SAYMON Object.
   *
   * @param {String} objectId Object ID.
   * @returns {Promise} Object information promise.
   */
  fetchObject(objectId) {
    return this.request({
      url: `${this.url}/node/api/objects/${objectId}`,
      method: 'GET'
    });
  }

  /**
   * Performs request to SAYMON through backend proxy. Returns raw response.
   *
   * @param {Object} options Request options.
   * @returns {Promise} Raw response promise.
   */
  requestRaw(options) {
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
  request(options) {
    return this.requestRaw(options)
      .then(response => {
        if (response.status != 200) throw new Error(`Request ${options.url} failed: ${response.status}`);

        return response.data;
      });
  }
}
