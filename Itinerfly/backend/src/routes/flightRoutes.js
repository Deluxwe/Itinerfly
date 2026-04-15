const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/flightController");
const { flightLimiter } = require("../middleware/rateLimiter");

router.use(flightLimiter);
router.get("/search",      ctrl.searchByLocation);
router.get("/departures",  ctrl.getDepartures);
router.get("/arrivals",    ctrl.getArrivals);
router.get("/:flightCode", ctrl.getFlightDetail);

module.exports = router;
