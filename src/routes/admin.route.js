const express = require("express");
const adminController = require("../controllers/admin.controller");
const validate = require("../middlewares/validate");
const { adminValidation } = require("../validations");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Create a new user
router.post("/login", validate(adminValidation.loginAdmin), adminController.loginAdmin);

// Forgot password
router.post("/forgot-password", validate(adminValidation.forgotPassword), adminController.forgotPassword);

// Reset password
router.post("/reset-password", validate(adminValidation.resetPassword), adminController.resetPassword);

// Change password
router.put("/change-password", authMiddleware, validate(adminValidation.changePassword), adminController.changePassword);

// // Edit user by ID
// router.put("/edit/:id", validate(userValidation.editUser), userController.editUser);

// // Delete user by ID (soft delete)
// router.delete("/delete/:id", userController.deleteUser);

// // Get user by ID
// router.get("/:id", userController.getUser);

// // Get all users
// router.get("/", userController.getAllUser);

module.exports = router;
