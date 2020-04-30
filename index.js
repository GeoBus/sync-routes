/* * */
/* * */
/* * * * * */
/* GEOBUS SYNC - ROUTES */
/* * */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const database = require("./services/database");
const carrisAPI = require("./services/carrisAPI");
const { Route } = require("./models/Route");

const syncRoutes = async () => {
  // Request Routes ETAs for each Stop from Carris API
  console.log("• Fetching all public routes...");
  const allRoutes = await carrisAPI.getAllRoutes();

  console.log("• Updating " + allRoutes.length + " routes...");

  // Setup a new instance of routesToBeSaved
  let routesToBeSaved = [];

  for (const route of allRoutes) {
    if (route.isPublicVisible) {
      // For each public route, get it's info
      const routeInfo = await carrisAPI.getRouteInfo(route.routeNumber);

      // Start a new route instance
      let newRoute = {
        number: routeInfo.routeNumber,
        name: routeInfo.name,
        variants: [],
      };

      // Check route kind (if it is a tram, neighborhood, elevator or night route)
      if (newRoute.number.slice(-1) == "B") {
        newRoute.kind = "neighborhood";
      } else if (newRoute.number.slice(-1) == "E") {
        if (newRoute.number.slice(0, 1) == "5") {
          newRoute.kind = "elevator"; // elevator is a subtype of tram
        } else {
          newRoute.kind = "tram";
        }
      } else if (newRoute.number.slice(0, 1) == "2") {
        newRoute.kind = "night";
      } else {
        newRoute.kind = "regular";
      }

      // Setup route variants
      for (const variant of routeInfo.variants) {
        // For each active variant, get it's stops
        if (variant.isActive) {
          let variantToBeSaved = {
            number: variant.variantNumber,
            isCircular: routeInfo.isCirc,
          };

          /* Ascending itinerary */
          if (variant.upItinerary) {
            let ascending = [];
            for (const connection of variant.upItinerary.connections) {
              ascending.push({
                orderInRoute: connection.orderNum,
                publicId: connection.busStop.publicId,
                name: connection.busStop.name,
                lat: connection.busStop.lat,
                lng: connection.busStop.lng,
              });
            }
            variantToBeSaved.ascending = ascending;
          }

          /* Descending itinerary */
          if (variant.downItinerary) {
            let descending = [];
            for (const connection of variant.downItinerary.connections) {
              descending.push({
                orderInRoute: connection.orderNum,
                publicId: connection.busStop.publicId,
                name: connection.busStop.name,
                lat: connection.busStop.lat,
                lng: connection.busStop.lng,
              });
            }
            variantToBeSaved.descending = descending;
          }

          /* Circular itinerary */
          if (variant.circItinerary) {
            let circular = [];
            for (const connection of variant.circItinerary.connections) {
              circular.push({
                orderInRoute: connection.orderNum,
                publicId: connection.busStop.publicId,
                name: connection.busStop.name,
                lat: connection.busStop.lat,
                lng: connection.busStop.lng,
              });
            }
            variantToBeSaved.circular = circular;
          }

          // Append this variant to the route
          newRoute.variants.push(variantToBeSaved);
        }
      }

      // Sort & Append this route to the main routesToBeSaved array
      newRoute.variants.sort((a, b) => a.variantNumber - b.variantNumber);
      routesToBeSaved.push(newRoute);
    }
  }

  // Replace all routes on the database
  console.log("• Replacing all routes on the database...");
  await Route.deleteMany({});
  await Route.insertMany(routesToBeSaved);

  console.log("• Done! Synced " + allRoutes.length + " routes.");
};

/* * *
 * SYNC LOOP
 */
(async () => {
  console.log();
  console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
  console.log("* * * * * * * * * * GEOBUS-SYNC * * * * * * * * * *");
  console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
  console.log();

  // Connect to the database
  await database.connect();

  // Set module configurations
  const syncIsOn = config.get("sync-is-on");
  const interval = config.get("sync-interval");

  // Run forever
  while (syncIsOn) {
    console.log();
    console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
    console.log("> Module: Routes");
    const start = new Date();
    console.log("> Sync started on " + start.toISOString());

    /* * * * * * * * * * * * */
    /* */ await syncRoutes();
    /* * * * * * * * * * * * */

    const syncDuration = new Date() - start;
    console.log("> Operation took " + syncDuration / 1000 + " seconds.");
    console.log("* * * * * * * * * * * * * * * * * * * * * * * * * *");
    console.log();
    let timeLeft = interval;
    let waiting = true;
    while (waiting) {
      process.stdout.write("Restarting in " + timeLeft + " seconds...\r");
      if (timeLeft-- == 0) waiting = false;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    process.stdout.write("Paused for " + interval + " seconds.");
    process.stdout.write("                  ");
    console.log();
  }
  // Disconnect from the database after execution (this should never happen)
  await database.disconnect();
})();
