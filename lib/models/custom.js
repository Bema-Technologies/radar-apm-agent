CustomModel = function () {
  this.startTime = Ntp._now();
  this.metrics = {};
}

_.extend(CustomModel.prototype, KadiraModel.prototype);

CustomModel.prototype.buildPayload = function () {
  var metrics = {};
  metrics.startTime = Kadira.syncedDate.syncTime(this.startTime);

  Object.assign(metrics, this.metrics);

  var now = Ntp._now();
  this.startTime = now;

  // reset custom metrics to 0
  Object.keys(this.metrics).forEach((key) => {
    this.metrics[key] = 0;
  });

  return {
    customMetrics: [
      metrics
    ]
  };
};

CustomModel.prototype.incMetric = function (name, amount) {
  if (this.metrics) {
    if (!this.metrics[name]) {
      this.metrics[name] = amount;
    } else {
      this.metrics[name] += amount;
    }
  }
}

CustomModel.prototype.decMetric = function (name, amount) {
  if (this.metrics) {
    if (!this.metrics[name]) {
      this.metrics[name] = amount;
    } else {
      this.metrics[name] -= amount;
    }
  }
}