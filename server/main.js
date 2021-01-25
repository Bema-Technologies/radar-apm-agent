// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';

Kadira.connect("LkbZABK9s4yGPJ26Q", "FS2zJT9rxiWcp49ET", {
  endpoint: "http://localhost:3000/engine"
});

Kadira.initMetric({
  name: "Links Added",
  type: "sum"
});

// Kadira.ignoreMethod(["links.insert"]);