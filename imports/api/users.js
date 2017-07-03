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
  });
};

Meteor.methods({
  'users.add': (userInfo) => {
    check(userInfo.email, String);
    check(userInfo.address, String);
    if (Meteor.isServer) Users.add(userInfo);
  },
});

export default Users;
