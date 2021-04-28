import { wrapFs } from "./fs.js";
import {
  MongoOplogDriver,
  MongoPollingDriver,
  Multiplexer,
  Server,
  Session,
  Subscription,
} from "./meteorx.js";

import { wrapWebApp } from "./wrap_webapp.js";

var logger = Npm.require('debug')('kadira:hijack:instrument');

var instrumented = false;
Kadira._startInstrumenting = function(callback) {
  if(instrumented) {
    callback();
    return;
  }

  instrumented = true;
  
  wrapStringifyDDP();
  wrapWebApp();
  wrapFs();

  Meteor.startup(async function () {
    wrapServer(Server.prototype);

    wrapSession(Session.prototype);
    wrapSubscription(Subscription.prototype);

    if (MongoOplogDriver) {
      wrapOplogObserveDriver(MongoOplogDriver.prototype);
    }

    if (MongoPollingDriver) {
      wrapPollingObserveDriver(MongoPollingDriver.prototype);
    }

    if (Multiplexer) {
      wrapMultiplexer(Multiplexer.prototype);
    }

    wrapForCountingObservers();
    hijackDBOps();

    setLabels();
    callback();
  });
};

// We need to instrument this rightaway and it's okay
// One reason for this is to call `setLables()` function
// Otherwise, CPU profile can't see all our custom labeling
Kadira._startInstrumenting(function() {
  console.log('Radar APM: completed instrumenting the app')
});
