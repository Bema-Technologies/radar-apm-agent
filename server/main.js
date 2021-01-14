// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';

Kadira.connect("LkbZABK9s4yGPJ26Q", "FS2zJT9rxiWcp49ET", {
  endpoint: "https://heavy-starfish-57.loca.lt/engine"
});

Kadira.initMetric({
  name: "Links Added",
  type: "sum"
});
