const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/api.response");
const messages = require("../json/message.json");
const { AdminModel } = require("../models");

// Required Config
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");

  // Check for token
  if (!token) {
    return apiResponse.UNAUTHORIZED({ res, message: messages.unauthorized });
  }

  try {
    // Verify token
    jwt.verify(token, JWT_SECRET, async function (err, decoded) {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const user = await AdminModel.findOne({ _id: decoded.userId });
      if (!user) {
        return apiResponse.UNAUTHORIZED({ res, message: messages.invalid_token });
      }
      req.user = user;
      next();
    });

    // Add user from payload
  } catch (e) {
    return apiResponse.UNAUTHORIZED({ res, message: messages.unauthorized });
  }
};
