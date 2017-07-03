import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const Users = new Mongo.Collection('users');
if(Meteor.isServer) {
  Meteor.publish('users', () => Users.find());
}

Users.add = (email, address) => {
  Users.upsert(
    {
      email,
    },
    email,
    address,
    createdAt: new Date(),
  )
};

Meteor.methods({
  'users.add': (email, address) => {
    check(addres, String);
    check(email, String);
    if(Meteor.isServer) Users.add(email, address);
  }
})
