const express = require("express");
const paymentHistoryController = require("../controllers/paymentHistory.controller");
const validate = require("../middlewares/validate");
const { paymentHistoryValidation } = require("../validations");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

// Create a new payment link
router.post("/createPaymentLink", validate(paymentHistoryValidation.createPaymentLink), paymentHistoryController.createPaymentLink);

// Get all payment list
router.get("/getAllPaymentList", authMiddleware, paymentHistoryController.getAllPaymentList);

// Webhook
router.post("/webhook", paymentHistoryController.webhook);

// Edit strategy by ID
router.get("/success", paymentHistoryController.success);

// Edit strategy by ID
router.get("/cancel", paymentHistoryController.cancel);

module.exports = router;
