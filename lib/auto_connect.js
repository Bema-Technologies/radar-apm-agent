Kadira._connectWithEnv = function() {
  if (Meteor &&
      Meteor.settings &&
      Meteor.settings.packages &&
      Meteor.settings.packages['bema:radar-apm-agent'] &&
      Meteor.settings.packages['bema:radar-apm-agent'].isDisabled) {
    console.log('Meteor APM: not connected because it was disabled in settings');
    return;
  }
  if(process.env.APM_APP_ID && process.env.APM_APP_SECRET && process.env.APM_OPTIONS_ENDPOINT) {
    var options = Kadira._parseEnv(process.env);

    Kadira.connect(
      process.env.APM_APP_ID,
      process.env.APM_APP_SECRET,
      options
    );

    Kadira.connect = function() {
      throw new Error('Meteor APM has already connected using credentials from Environment Variables');
    };
  }
  // other forms of Kadira.connect are not supported
};

// Try to connect automatically
Kadira._connectWithEnv();
