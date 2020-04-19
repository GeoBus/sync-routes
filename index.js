/* * */
/* * */
/* * * * * */
/* GEOBUS SYNC STOPS */
/* * */
/* * */

/* * */
/* IMPORTS */
const database = require("./services/database");
const carrisAPI = require("./services/carrisAPI");
const { Route } = require("./models/Route");

(async () => {
  console.log("* * * GEOBUS-SYNC-ROUTES * * *");
  console.log();

  await database.connect();

  console.log("Starting...");

  // Request Routes ETAs for each Stop from Carris API
  const allRoutes = await carrisAPI.getAllRoutes();

  console.log("Updating " + allRoutes.length + " routes...");

  const savedRoutes = await Route.find({});

  for (const route of allRoutes) {
    if (route.isPublicVisible) {
      await Route.findOneAndUpdate(
        // Query
        { routeNumber: route.routeNumber },
        // New document values
        { name: route.name },
        // Options
        { upsert: true }
      );
    }
  }

  console.log("Done! Synced " + allRoutes.length + " stops.");

  await database.disconnect();
  console.log("* * * * * * * * * * * *");
  console.log();
})();
