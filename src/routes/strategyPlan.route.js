const express = require("express");
const strategyPlanController = require("../controllers/strategyPlan.controller");
const validate = require("../middlewares/validate");
const { strategyPlanValidation } = require("../validations");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Add Plan
router.post("/add/:id", authMiddleware, validate(strategyPlanValidation.addStrategyPlan), strategyPlanController.addStrategyPlan);

// Edit Plan
router.put("/edit/:id", authMiddleware, validate(strategyPlanValidation.editStrategyPlan), strategyPlanController.editStrategyPlan);

// Delete Plan
router.delete("/delete/:id", authMiddleware, strategyPlanController.deleteStrategyPlan);

// Get Single Plan
router.get("/:id", authMiddleware, strategyPlanController.getStrategyPlan);

// Get All Plans for a Strategy
router.get("/all/:strategyId", authMiddleware, strategyPlanController.getAllPlansForStrategy);

module.exports = router;
