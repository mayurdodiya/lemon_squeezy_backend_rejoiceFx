const express = require("express");
const strategiesController = require("../controllers/strategies.controller");
const validate = require("../middlewares/validate");
const { strategiesValidation } = require("../validations");
const uploadInLocal = require("../services/upload");
// const { localUpload } = require("../services/s3.upload");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Upload Image
router.post("/upload", authMiddleware, uploadInLocal.single("image"), strategiesController.uploadImage);

// Create a new strategy
router.post("/add", authMiddleware, validate(strategiesValidation.addStrategy), strategiesController.addStrategy);

// Edit strategy by ID
router.put("/edit/:id", authMiddleware, validate(strategiesValidation.editStrategy), strategiesController.editStrategy);

// Delete strategy by ID (soft delete)
router.delete("/delete/:id", authMiddleware, strategiesController.deleteStrategy);

// Get strategy by ID
router.get("/:id", strategiesController.getStrategy);

// Get all strategies
router.get("/", strategiesController.getAllStrategies);

module.exports = router;
