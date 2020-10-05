const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const mongoose = require("mongoose");
const Products = require("../models/Products");
const User = require("../models/User");

router.get("/", function (req, res) {
  res.render(`welcome`);
});
router.get("/contact", ensureAuthenticated, function (req, res) {
  res.render(`contact`, { user: req.user });
});
router.post("/shop_now/add_to_wishlist", ensureAuthenticated, (req, res) => {
  var id = req.query.itemID;
  Products.findById(id, function (err, item) {
    if (err) {
      throw err;
    } else {
      req.user.wishlist.push(mongoose.Types.ObjectId(id));
      req.user.save();
      item.counter += 1;
      item.save();
      req.flash("success_message", "Item added to wishlist successfully");
      res.redirect("/wishlist");
    }
  });
});

router.post("/shop_now/add_to_cart", ensureAuthenticated, (req, res) => {
  var id = req.query.itemID;
  Products.findById(id, function (err, item) {
    if (err) {
      throw err;
    } else {
      req.user.cart.push(mongoose.Types.ObjectId(id));
      req.user.save();
      req.flash("success_message", "Item added to cart successfully");
      res.redirect("/cart");
    }
  });
});

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
router.post("/cart/delete", ensureAuthenticated, (req, res) => {
  var i = req.query.deletedItem;
  req.user.cart.splice(i, 1);
  req.user.save();
  req.flash("success_message", "Removed item successfully");
  res.redirect(req.get("referer"));
});
router.post("/wishlist/delete", ensureAuthenticated, (req, res) => {
  var i = req.query.deletedItem;
  req.user.wishlist.splice(i, 1);
  req.user.save();
  req.flash("success_message", "Removed item successfully");
  res.redirect("/wishlist");
});
router.post("/wishlist/addAllToCart", ensureAuthenticated, (req, res) => {
  for (var i = 0; i < req.user.wishlist.length; i++) {
    req.user.cart.push(req.user.wishlist[i]);
  }
  req.user.wishlist = [];
  req.user.save();
  req.flash("success_message", "All wishlist items added to cart");
  res.redirect("/cart");
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
      console.log(products);
      res.render("wishlist", { user: req.user, products: products });
    }
  })
);

router.get("/shop_now", ensureAuthenticated, (req, res) => {
  var sortCondition = {};
  if (req.query.sort_type === "Price: High to Low") {
    sortCondition = { price: -1 };
  } else if (req.query.sort_type === "Price: Low to High") {
    sortCondition = { price: 1 };
  } else if (req.query.sort_type === "Popularity") {
    sortCondition = { counter: -1 };
  }

  if (req.query.search) {
    const regex = new RegExp(searchRegularExpression(req.query.search), "gi");
    Products.find({ $or: [{ name: regex }, { description: regex }] })
      .sort(sortCondition)
      .exec(function (err, products) {
        if (err) throw err;
        else {
          res.render("shop_now", { user: req.user, products: products });
        }
      });
  } else {
    Products.find({})
      .sort(sortCondition)
      .exec(function (err, products) {
        if (err) throw err;
        else {
          res.render("shop_now", { user: req.user, products: products });
        }
      });
  }
});
function searchRegularExpression(searchQuery) {
  return searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.post("/cart", ensureAuthenticated, (req, res) => {
  if (req.user.cart.length === 0) {
    req.flash("error_message", "There are no items in the cart.");
    res.redirect("back");
  } else {
    req.user.ordered_items.push(...req.user.cart);
    req.user.cart = [];
    req.user.save();
    req.flash("success_message", "Ordered successfully");
    res.redirect("/dashboard");
  }
});

module.exports = router;
