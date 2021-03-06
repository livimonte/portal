import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const Users = new Mongo.Collection('users');
if (Meteor.isServer) {
  Meteor.publish('users', () => Users.find());
}

Users.add = (userInfo) => {
  const email = userInfo.email;
  const address = userInfo.address;
  Users.insert({
    email,
    address,
    verified: false,
  });
};

Meteor.methods({
  'users.add': (userInfo) => {
    check(userInfo.email, String);
    check(userInfo.address, String);
    const isEmailCorrect = /\S+@\S+\.\S+/.test(userInfo.email);
    if (Meteor.isServer && isEmailCorrect) Users.add(userInfo);
  },
});

export default Users;
