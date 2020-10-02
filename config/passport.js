const LocalStrategy = require("passport-local").Strategy;
// const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        User.findOne({ email: email })
          .then((user) => {
            if (!user) {
              return done(null, false, { message: "Invalid Email" });
            }
            bcrypt.compare(password, user.password, (err, doesMatch) => {
              if (err) {
                throw err;
              }

              if (doesMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Invalid Password" });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
