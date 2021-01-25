ErrorModel = function (appId) {
  BaseErrorModel.call(this);
  var self = this;
  this.appId = appId;
  this.errors = {};
  this.startTime = Date.now();
  this.maxErrors = 10;
}

_.extend(ErrorModel.prototype, KadiraModel.prototype);
_.extend(ErrorModel.prototype, BaseErrorModel.prototype);

ErrorModel.prototype.buildPayload = function () {
  var metrics = _.values(this.errors);
  this.startTime = Ntp._now();

  let cleanedMetrics = [];
  _.each(metrics, function (metric) {
    metric.startTime = Kadira.syncedDate.syncTime(metric.startTime);
    if (metric.type != 'method') {
      cleanedMetrics.push(metric);
    } else {
      if (Kadira.models.methods.ignoredMethods.has(metric.subType)) {
        delete metric.trace;
        metric.stacks = [{ stack: "Error stack wiped due to ignore list." }];
      }
      
      cleanedMetrics.push(metric);
    }
  });

  this.errors = {};
  return { errors: cleanedMetrics };
};

ErrorModel.prototype.errorCount = function () {
  return _.values(this.errors).length;
};

ErrorModel.prototype.trackError = function (ex, trace) {
  // TODO
  // this correct?
  // stops wierd non-error metrics coming through non-descriptive server-internal errors
  if (!ex.message) {
    return;
  }

  var key = trace.type + ':' + ex.message;
  if (this.errors[key]) {
    this.errors[key].count++;
  } else if (this.errorCount() < this.maxErrors) {
    var errorDef = this._formatError(ex, trace);
    if (this.applyFilters(errorDef.type, errorDef.name, ex, errorDef.subType)) {
      this.errors[key] = this._formatError(ex, trace);
    }
  }
};

ErrorModel.prototype._formatError = function (ex, trace) {
  var time = Date.now();
  var stack = ex.stack;

  // to get Meteor's Error details
  if (ex.details) {
    stack = "Details: " + ex.details + "\r\n" + stack;
  }

  // Update trace's error event with the next stack
  var errorEvent = trace.events && trace.events[trace.events.length - 1];
  var errorObject = errorEvent && errorEvent[2] && errorEvent[2].error;

  if (errorObject) {
    errorObject.stack = stack;
  }

  return {
    appId: this.appId,
    name: ex.message || `${trace.type} ${trace.subType}`,
    type: trace.type,
    startTime: time,
    subType: trace.subType || trace.name,
    trace: trace,
    stacks: [{ stack: stack }],
    count: 1,
  }
};
