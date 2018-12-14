import _ from 'lodash';
import * as dateMath from 'app/core/utils/datemath';

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
    const start = this.convertToTsdbTime(options.rangeRaw.from, false) || '1h-ago';
    const end = this.convertToTsdbTime(options.rangeRaw.to, true);
    const query = _.chain(options.targets)
      .filter(target => target.objectId && target.metricName && !target.hide)
      .map(target => {
        target.from = start;
        target.to = end;

        return target;
      })
      .value();

    if (query.length <= 0) {
      return this.q.when({ data: [] });
    }

    const promises = _.map(query, row => this.fetchMetric(row));

    return Promise.all(promises).then(data => ({ data }));
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
   * Fetches data for single Object-metric pair.
   *
   * @param {Object} query Metric query.
   * @returns {Promise} Metric data promise.
   */
  fetchMetric(query) {
    let url = `${this.url}/node/api/objects/${query.objectId}/history?metrics=${query.metricName}&from=${query.from}`;

    if (query.to) {
      url += `&to=${query.to}`;
    }

    const nameField = query.displayPath ? 'path' : 'name';

    return Promise
      .all([
        this.request({ url, method: 'GET' }),
        this.fetchObject(query.objectId, [nameField])
      ])
      .then(responses => {
        const historyData = responses[0];
        const objectInfo = responses[1];
        const data = historyData[0];

        return {
          target: `${objectInfo[nameField]}:${query.metricName}`,
          datapoints: _.map(data.dps, dp => dp.reverse())
        };
      });
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
   * @param {String[]} [fields] List of object fields to fetch.
   * @returns {Promise} Object information promise.
   */
  fetchObject(objectId, fields) {
    return this.request({
      url: `${this.url}/node/api/objects/${objectId}` + (!_.isEmpty(fields) ? `?fields=${fields.join(',')}` : ''),
      method: 'GET'
    });
  }

  /**
   * Fetches full paths for all SAYMON Objects, paired with Object IDs.
   *
   * @returns {Promise} Path list promise.
   */
  listObjectPaths() {
    return this.request({
      url: `${this.url}/node/api/objects?fields=id,path`,
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

  /**
   * Converts date-time to OpenTSDB format, supported by SAYMON.
   *
   * @param {String|Number} date Date-time string or number to convert.
   * @param {Boolean} roundUp Round-up flag.
   * @returns {*} Conversion result.
   */
  convertToTsdbTime(date, roundUp) {
    if (date === 'now') {
      return null;
    }

    date = dateMath.parse(date, roundUp);

    return date.valueOf();
  }
}
