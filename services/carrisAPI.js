/* * *
 * * *
 * * * * * *
 * RETRIEVE OBJECTS FROM CARRIS API
 * AND SAVE THEM TO THE DATABASE
 * * *
 */

/* * *
 * IMPORTS
 */
const request = require("request");

/* * *
 * Prepare the request parameters
 * according to the Carris API requirements.
 */

/* * *
 * Where and which service to call the Carris API.
 */
const setAPIEndpoint = (service) => {
  return "https://carris.tecmic.com/api/v2.8/" + service;
};

/* * *
 * Set request headers with Application Type.
 */
const setRequestHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

/* * *
 * Request the Carris API for the specified params.
 */
const requestCarrisAPI = (params) => {
  // This method returns a Promise to it's caller,
  // which is only resolved after the correct response from the API.
  return new Promise((resolve, reject) => {
    // Perform the request
    request(params, async (err, res, body) => {
      // Reject if a connection error occurs
      if (err) reject(err);
      // Reject if there is an error with invoice creation
      else if (res.statusCode >= 400 && res.statusCode <= 500)
        reject(JSON.parse(body).errors);
      // Resolve promise with request result
      else resolve(JSON.parse(body));
    });
  });
};

/* * *
 * Request Carris API for the latest vehicleStatuses.
 */
exports.getAllRoutes = async () => {
  // Set request params
  const params = {
    method: "GET",
    url: setAPIEndpoint("Routes"),
    headers: setRequestHeaders(),
  };

  // Perform the request to the Carris API
  // and return response to the caller
  return await requestCarrisAPI(params)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("carrisAPI.getAllRoutes()");
      console.log("Failed getting all routes from Carris API.");
      console.log(error);
      return [];
    });
};
