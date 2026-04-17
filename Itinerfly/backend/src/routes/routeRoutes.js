// Ruta dedicada para GET /api/routes
// Separada de airlineRoutes para evitar el conflicto en server.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/airlineController");
const { flightLimiter } = require("../middleware/rateLimiter");

router.use(flightLimiter);
router.get("/", ctrl.getRoutes);

module.exports = router;
