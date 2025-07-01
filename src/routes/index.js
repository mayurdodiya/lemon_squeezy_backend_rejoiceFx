const express = require("express");

const router = express.Router();

/** Normal user routes */
// router.use("/auth", require("./auth.route"));

/** Payment routes */
router.use("/payment", require("./payment.route"));

/** User routes */
router.use("/user", require("./user.route"));

/** Strategies routes */
router.use("/strategies", require("./strategies.route"));

/** Strategy Plan routes */
router.use("/strategyPlan", require("./strategyPlan.route"));

/** Admin routes */
router.use("/admin", require("./admin.route"));

module.exports = router;
