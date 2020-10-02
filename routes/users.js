const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");

const User = require("../models/User");
router.get("/login", (req, res) => res.render("login"));
router.get("/sign_up", (req, res) => res.render("sign_up"));
router.get("/edit_profile",ensureAuthenticated, (req, res) => res.render("edit_profile",{user:req.user}));

router.post("/sign_up", (req, res) => {
  const { name, email, password, password2 } = req.body;
  //validate data
  let errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ message: "Fill in all the data" });
  }
  if (password.length < 6) {
    errors.push({ message: "Password is too short" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("sign_up", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User already exists
        errors.push({ message: "Email already taken" });
        res.render("sign_up", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const RegisteredUser = new User({
          name,
          email,
          password,
        });
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(RegisteredUser.password, salt, (err, hash) => {
            if (err) throw err;
            RegisteredUser.password = hash;

            RegisteredUser.save()
              .then((user) => {
                req.flash(
                  "success_message",
                  "Signed Up successfully. Login to continue"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.post('/edit_profile',ensureAuthenticated,(req,res)=>{
  const { name, email, delivery_address } = req.body;
  console.log(req.user.id);
  console.log(`User ID ${req.user.id}`);
  req.flash('success_message','Information Updated Successfully');
  res.redirect('/dashboard');
  
  // 
  // User.findByIdAndUpdate()
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", function (req, res, next) {
  req.logout();
  req.flash("success_message", "Logged out successfully");
  res.redirect("/users/login");
});

router.put('/edit_profile')
module.exports = router;
