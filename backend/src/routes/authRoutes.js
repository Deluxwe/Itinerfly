const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authLimiter }  = require("../middleware/rateLimiter");

router.post("/login",  authLimiter, ctrl.login);
router.post("/logout", requireAuth, ctrl.logout);
router.get("/me",      requireAuth, ctrl.me);

module.exports = router;
