const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const mongoose = require("mongoose");
const Products = require("../models/Products");
const User = require("../models/User");

router.get("/", (req, res) => res.render(`welcome`));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Products.find({ _id: { $in: req.user.ordered_items } }, function (
    err,
    products
  ) {
    if (err) throw err;
    else {
      res.render("dashboard", { user: req.user, products: products });
    }
  });
});
router.get("/cart", ensureAuthenticated, (req, res) =>
  Products.find({ _id: { $in: req.user.cart } }, function (err, products) {
    if (err) throw err;
    else {
      res.render("cart", { user: req.user, products: products });
    }
  })
);
router.get("/wishlist", ensureAuthenticated, (req, res) =>
  Products.find({ _id: { $in: req.user.wishlist } }, function (err, products) {
    if (err) throw err;
    else {
      res.render("wishlist", { user: req.user, products: products });
    }
  })
);
router.post("/wishlist", ensureAuthenticated, (req, res) => {
  for (var i = 0; i < req.user.wishlist.length; i++) {
    req.user.cart.push(req.user.wishlist[i]);
  }
  wishlist = [];
  req.flash("success_message", "All wishlist items added to cart");
  res.redirect("/cart");
});

router.get("/shop_now", ensureAuthenticated, (req, res) => {
  //Fuzzy Search
  if (req.query.search) {
    const regex = new RegExp(searchRegularExpression(req.query.search),'gi');
    Products.find({'name':regex}, function (err, products) {
      if (err) throw err;
      else {
        res.render("shop_now", { user: req.user, products: products });
      }
    });
  } else {
    Products.find({}, function (err, products) {
      if (err) throw err;
      else {
        res.render("shop_now", { user: req.user, products: products });
      }
    });
  }
});
function searchRegularExpression(searchQuery) {
  return searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.post("/cart", ensureAuthenticated, (req, res) => {
  req.user.ordered_items.push(...req.user.cart);
  req.user.cart = [];
  req.user.save();
  req.flash("success_message", "Ordered successfully");
  res.redirect("/dashboard");
});

module.exports = router;
