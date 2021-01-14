# Radar APM (formerly Kadira)

## Custom Metrics Tracking

First init a custom metric to be tracked on server startup:

```
Kadira.initMetric({
  name: "httpRequests",
  type: "sum" // can be a type of sum or avg
})
```

Then where you want to go ahead and track a metric do something like:
```
WebApp.connectHandlers.use('/', (req, res, next) => {
  next();

  res.on("close", () => {
    Kadira.incMetric({
      name: "httpRequests",
      amount: 1
    });
  });
});
```

More examples to come....

Check out the [Meteor APM Guide](http://galaxy-guide.meteor.com/apm-getting-started.html) for more information and improve your app with Meteor APM.