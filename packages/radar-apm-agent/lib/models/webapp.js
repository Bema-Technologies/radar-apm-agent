const WEBAPP_FIELDS = ['db', 'http', 'email', 'async', 'compute', 'total', 'fs', '1xx', '2xx', '3xx', '4xx', '5xx'];
const AVG_FIELDS = ['db', 'http', 'email', 'async', 'compute', 'total', 'fs'];

WebAppModel = function () {
  this.metricsByMinute = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 10,
    maxTotalPoints: 30,
    archiveEvery: 10
  });

  this.tracerStore.start();
}

_.extend(WebAppModel.prototype, KadiraModel.prototype);

WebAppModel.prototype.processRequest = function (trace, req, res) {
  if (trace) {
    const dateId = this._getDateId(trace.at);
    this._appendMetrics(dateId, trace, res);
    this.tracerStore.addTrace(trace);
  }
}

WebAppModel.prototype._getMetrics = function (timestamp, routeId) {
  const dateId = this._getDateId(timestamp);

  if (!this.metricsByMinute[dateId]) {
    this.metricsByMinute[dateId] = {
      routes: Object.create(null)
    };
  }

  const routes = this.metricsByMinute[dateId].routes;

  if (!routes[routeId]) {
    routes[routeId] = {
      count: 0,
      errors: 0,
      maxResTime: 0
    };

    WEBAPP_FIELDS.forEach(function (field) {
      routes[routeId][field] = 0;
    });
  }

  return this.metricsByMinute[dateId].routes[routeId];
}

WebAppModel.prototype._appendMetrics = function (dateId, trace, res) {
  var requestMetrics = this._getMetrics(dateId, trace.name);

  if (!this.metricsByMinute[dateId].startTime) {
    this.metricsByMinute[dateId].startTime = trace.at;
  }

  // merge
  WEBAPP_FIELDS.forEach(field => {
    var value = trace.metrics[field];
    if (value > 0) {
      requestMetrics[field] += value;
    }
  });

  const statusCode = res.statusCode;
  let statusMetric;

  if (statusCode < 200) {
    statusMetric = '1xx';
  } else if (statusCode < 300) {
    statusMetric = '2xx';
  } else if (statusCode < 400) {
    statusMetric = '3xx';
  } else if (statusCode < 500) {
    statusMetric = '4xx';
  } else if (statusCode < 600) {
    statusMetric = '5xx';
  }

  if (!requestMetrics[statusMetric]) {
    requestMetrics[statusMetric] = 0;
  }

  if (trace.metrics.total > requestMetrics.maxResTime) {
    requestMetrics.maxResTime = trace.metrics.total;
  }

  requestMetrics[statusMetric] += 1;
  requestMetrics.count += 1;

  this.metricsByMinute[dateId].endTime = trace.metrics.at;
}

WebAppModel.prototype.buildPayload = function () {
  var payload = {
    httpMetrics: [],
    httpRequests: []
  };

  var metricsByMinute = this.metricsByMinute;
  this.metricsByMinute = Object.create(null);

  for (var key in metricsByMinute) {
    var metrics = metricsByMinute[key];
    // convert startTime into the actual serverTime
    var startTime = metrics.startTime;
    metrics.startTime = Kadira.syncedDate.syncTime(startTime);

    for (var requestName in metrics.routes) {
      AVG_FIELDS.forEach(function (field) {
        metrics.routes[requestName][field] /= metrics.routes[requestName].count;
      });
    }

    payload.httpMetrics.push(metricsByMinute[key]);
  }

  payload.httpRequests = this.tracerStore.collectTraces();

  return payload;
}