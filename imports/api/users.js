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
  // 'users.add': (userInfo) => {
  //   check(userInfo.email, String);
  //   check(userInfo.address, String);
  //   const isEmailCorrect = /\S+@\S+\.\S+/.test(userInfo.email);
  //   if (Meteor.isServer && isEmailCorrect) Users.add(userInfo);
  // },
  'users.add': (formData, captchaData) => {
    console.log('this.connection.clientAddress ', this.connection.clientAddress);
    const verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captchaData);

    if (!verifyCaptchaResponse.success) {
      console.log('reCAPTCHA check failed!', verifyCaptchaResponse);
      throw new Meteor.Error(422, `reCAPTCHA Failed: ${verifyCaptchaResponse.error}`);
    } else {
      console.log('reCAPTCHA verification passed!');
      check(userInfo.email, String);
      check(userInfo.address, String);
      const isEmailCorrect = /\S+@\S+\.\S+/.test(userInfo.email);
      if (Meteor.isServer && isEmailCorrect) Users.add(userInfo);
    }
    return true;
  },
});

export default Users;
