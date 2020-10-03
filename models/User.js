const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  delivery_address: {
    type: String,
    default: "",
  },
  phone:{
    type:String,
    default:""
  },
  wishList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
  ],
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
  ],
  ordered_items: [
    [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },{
      type: Date
    }]
  ],
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
