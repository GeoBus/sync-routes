/* * */
/* * */
/* * * * * */
/* CONNECTION TO MONGODB */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const mongoose = require("mongoose");

exports.connect = async function () {
  await mongoose
    .connect(config.get("database.connection-string"), {
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true, // Temporary fixes for deprecation warnings.
    })
    .then(() => console.log("Connected to MongoDB."))
    .catch((error) => {
      console.log("Connection to MongoDB failed.");
      console.log("At database.js > mongoose.connect()");
      console.log(error);
    });
};

exports.disconnect = async function () {
  await mongoose
    .disconnect()
    .then(() => console.log("Disconnected from MongoDB."))
    .catch((error) => {
      console.log("Failed closing connection to MongoDB.");
      console.log("At database.js > mongoose.disconnect()");
      console.log(error);
    });
};
