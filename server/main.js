// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';

Kadira.connect("dCtYwcGtWH7mF4yyc", "ho5h4GvYkamhuLd7r", {
  endpoint: "http://localhost:3001/engine"
});

Kadira.initMetric({
  name: "Links Added",
  type: "sum"
});

Kadira.ignoreMethod(["links.insert"]);