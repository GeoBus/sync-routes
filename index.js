/* * */
/* * */
/* * * * * */
/* GEOBUS SYNC - ROUTES */
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

  routesToBeSaved.sort();

  await Route.deleteMany({});
  await Route.insertMany(routesToBeSaved);

  console.log("Done! Synced " + allRoutes.length + " routes.");

  await database.disconnect();
  console.log("* * * * * * * * * * * *");
  console.log();
})();
