/* * */
/* IMPORTS */
const mongoose = require("mongoose");

/* * */
/* * */
/* * */
/* * * * * */
/* MONGO DB MODEL */
/* * */
/* * */
/* Schema for MongoDB ["Route"] Object */
exports.Route = mongoose.model(
  "Route",
  new mongoose.Schema({
    routeNumber: {
      type: String,
      maxlength: 3,
    },
    name: {
      type: String,
      maxlength: 100,
    },
    shape: {
      type: String,
      maxlength: 100,
    },
  })
);
