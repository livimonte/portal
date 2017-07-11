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
    isFunded: false,
  });
};


Meteor.methods({
  'users.add'(userData, captchaData) {
    check(userData.email, String);
    check(userData.address, String);
    check(captchaData, String);
    if (Meteor.isServer) {
      const verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captchaData);
      if (!verifyCaptchaResponse.success) {
        console.log('reCAPTCHA check failed!', verifyCaptchaResponse);
        throw new Meteor.Error(422, `reCAPTCHA Failed: ${verifyCaptchaResponse.error}`);
      } else {
        console.log('reCAPTCHA verification passed!');
        const isEmailCorrect = /\S+@\S+\.\S+/.test(userData.email);
        if (Meteor.isServer && isEmailCorrect) Users.add(userData);
      }
      return true;
    }
  },
});

export default Users;

