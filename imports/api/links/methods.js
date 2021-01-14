// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Links } from './links.js';

Meteor.methods({
  'links.insert'(title, url) {
    check(url, String);
    check(title, String);

    Kadira.incMetric({
      name: "Links Added",
      amount: 1
    })

    return Links.insert({
      url,
      title,
      createdAt: new Date(),
    });
  },
});
