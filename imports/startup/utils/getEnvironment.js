import { Meteor } from 'meteor/meteor';

if (!Meteor.settings.public.ENVIRONMENT) {
  console.error(
    'Meteor.settings.public.ENVIRONMENT not found! Make sure you have the latest settings folder and ran Meteor with `npm start` instead of `meteor`?',
  );
}

const getEnvironment = () =>
  Meteor.settings.public.ENVIRONMENT || Meteor.isProduction
    ? 'production'
    : 'development';

export default getEnvironment;
