const { AIRLINES, ROUTES } = require("../mock/flightData");
const { success, serverError } = require("../utils/responseHelpers");

// GET /api/airlines — siempre desde mock (datos estáticos del aeropuerto)
async function getAirlines(req, res) {
  try {
    return success(res, { count: AIRLINES.length, airlines: AIRLINES });
  } catch (err) {
    console.error("[getAirlines]", err.message);
    return serverError(res, err.message);
  }
}

// GET /api/routes — siempre desde mock (rutas estáticas)
async function getRoutes(req, res) {
  try {
    return success(res, { count: ROUTES.length, routes: ROUTES });
  } catch (err) {
    console.error("[getRoutes]", err.message);
    return serverError(res, err.message);
  }
}

module.exports = { getAirlines, getRoutes };
