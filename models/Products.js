const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
  },
  price:{
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  images: [{
    type: String,
    default:"",
  }],
  counter:{
    type:Number,
    default:0,
  }
});

const Products = mongoose.model("Products", ProductsSchema);
module.exports = Products;
