import { Meteor } from 'meteor/meteor';

import pkg from '/package.json';

import getEnvironment from './getEnvironment';

const Raven = Meteor.isClient ? require('raven-js') : require('raven');

Raven.config(
  Meteor.isClient
    ? Meteor.settings.public.SENTRY_PUBLIC_DSN
    : Meteor.settings.private.SENTRY_DSN,
  {
    environment: getEnvironment(),
    release: pkg.version,
  },
).install();

global.Raven = Raven;

export default Raven;
