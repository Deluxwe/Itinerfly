// ============================================================
// src/controllers/airlineController.js
// Controlador para aerolíneas y rutas
// ============================================================

const flightService = require("../services/flightAwareService");
const { success, serverError } = require("../utils/responseHelpers");

// GET /api/airlines
async function getAirlines(req, res) {
  try {
    const airlines = await flightService.getAirlines();
    return success(res, { count: airlines.length, airlines });
  } catch (err) {
    console.error("[getAirlines]", err.message);
    return serverError(res, err.message);
  }
}

// GET /api/routes
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
