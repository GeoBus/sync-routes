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
const { Route } = require("./models/Stop");

(async () => {
  console.log("* * * GEOBUS-SYNC-STOPS * * *");
  console.log();

  await database.connect();

  console.log("Starting...");

  console.log("Updating " + savedRoutes.length + " routes...");

  // Request Routes ETAs for each Stop from Carris API
  const allRoutes = await carrisAPI.getAllRoutes();

  const savedRoutes = await Routes.find({});

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
