import Raven from 'raven-js';

import pkg from '/package.json';

Raven.config(Meteor.settings.public.SENTRY_PUBLIC_DSN, {
  environment: Meteor.isDevelopment ? 'development' : 'production',
  release: pkg.version,
}).install();

window.Raven = Raven;

export default Raven;
