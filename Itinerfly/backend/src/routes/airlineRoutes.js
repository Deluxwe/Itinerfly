const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/airlineController");
const { flightLimiter } = require("../middleware/rateLimiter");

router.use(flightLimiter);
router.get("/",       ctrl.getAirlines);
router.get("/routes", ctrl.getRoutes);

module.exports = router;
