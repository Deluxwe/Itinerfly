const flightService = require("../services/flightAwareService");
const { success, serverError } = require("../utils/responseHelpers");

async function getAirlines(req, res) {
  try {
    const airlines = await flightService.getAirlines();
    return success(res, { count: airlines.length, airlines });
  } catch (err) {
    console.error("[getAirlines]", err.message);
    return serverError(res, err.message);
  }
}

async function getRoutes(req, res) {
  try {
    const routes = await flightService.getRoutes();
    return success(res, { count: routes.length, routes });
  } catch (err) {
    console.error("[getRoutes]", err.message);
    return serverError(res, err.message);
  }
}

module.exports = { getAirlines, getRoutes };
