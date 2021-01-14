CustomModel = function () {
  this.startTime = Ntp._now();
  this.metrics = {};
}

_.extend(CustomModel.prototype, KadiraModel.prototype);

CustomModel.prototype.buildPayload = function () {
  var metrics = {};
  metrics.startTime = Kadira.syncedDate.syncTime(this.startTime);

  Object.keys(this.metrics).forEach((key) => {
    if (this.metrics[key].type == 'sum') {
      metrics[key] = this.metrics[key].value;
    } else if (this.metrics[key].type == 'avg') {
      if (this.metrics[key].count > 0) {
        metrics[key] = this.metrics[key].value / this.metrics[key].count;
      } else {
        metrics[key] = 0;
      }
    }
  })

  var now = Ntp._now();
  this.startTime = now;

  // reset the metrics
  Object.keys(this.metrics).forEach((key) => {
    this.metrics[key].value = 0;
    this.metrics[key].count = 0;
  });

  return {
    customMetrics: [
      metrics
    ]
  };
};

// type can be sum, avg
CustomModel.prototype.initMetric = function (name, type) {
  if (["_id", "appId", "host", "startTime"].includes(name)) {
    console.error("Radar APM: Invalid custom metric name.");
    return;
  }

  if (!["avg", "sum"].includes(type)) {
    console.error("Radar APM: Invalid custom metric type.");
    return;
  }

  
  this.metrics[name] = {
    value: 0,
    count: 0,
    type
  };
}

CustomModel.prototype.inc = function (name, amount) {
  if (typeof this.metrics[name]) {
    this.metrics[name].value += amount;
    this.metrics[name].count += 1;
  } else {
    console.warn(`Radar APM: Could not increment Kadira metric ${name}. Was this metric initialized?`)
  }
}
