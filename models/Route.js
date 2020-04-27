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
    number: {
      type: String,
      maxlength: 3,
    },
    name: {
      type: String,
      maxlength: 100,
    },
    kind: {
      type: String,
      maxlength: 15,
    },
    variants: [
      {
        number: { type: Number, maxlength: 2 },
        isCircular: { type: Boolean },
        ascending: [
          {
            orderInRoute: {
              type: Number,
              maxlength: 30,
            },
            publicId: {
              type: String,
              maxlength: 6,
            },
            name: {
              type: String,
              maxlength: 30,
            },
            lat: {
              type: Number,
              maxlength: 30,
            },
            lng: {
              type: Number,
              maxlength: 30,
            },
          },
        ],
        descending: [
          {
            orderInRoute: {
              type: Number,
              maxlength: 30,
            },
            publicId: {
              type: String,
              maxlength: 6,
            },
            name: {
              type: String,
              maxlength: 30,
            },
            lat: {
              type: Number,
              maxlength: 30,
            },
            lng: {
              type: Number,
              maxlength: 30,
            },
          },
        ],
        circular: [
          {
            orderInRoute: {
              type: Number,
              maxlength: 30,
            },
            publicId: {
              type: String,
              maxlength: 6,
            },
            name: {
              type: String,
              maxlength: 30,
            },
            lat: {
              type: Number,
              maxlength: 30,
            },
            lng: {
              type: Number,
              maxlength: 30,
            },
          },
        ],
      },
    ],
  })
);
