const express = require("express");
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const { userValidation } = require("../validations");

const router = express.Router();

// Create a new user
router.post("/add", validate(userValidation.addUser), userController.addUser);

// Edit user by ID
router.put("/edit/:id", validate(userValidation.editUser), userController.editUser);

// Delete user by ID (soft delete)
router.delete("/delete/:id", userController.deleteUser);

// Get user by ID
router.get("/:id", userController.getUser);

// Get all users
router.get("/", userController.getAllUser);

module.exports = router;
