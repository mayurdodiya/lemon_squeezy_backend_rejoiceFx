const message = require("../json/message.json");
const { AdminModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");
const { comparePassword, generateToken, hashPassword } = require("../utils/utils");
const sendEmail = require("./../services/sendgrid");
const { sendResetPwdLink } = require("../templates/emailTemplate"); // Adjust path if needed

module.exports = {
  loginAdmin: async (req, res) => {
    try {
      const reqBody = req.body;
      const admin = await AdminModel.findOne({ email: reqBody.email, deletedAt: null });
      if (!admin) {
        return apiResponse.NOT_FOUND({ res, message: message.user_not_found });
      }

      const pwdMatch = await comparePassword({ password: reqBody.password, hash: admin.password });
      if (!pwdMatch) {
        return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials || "Invalid credentials" });
      }

      const token = generateToken({ userId: admin._id, email: admin.email });
      delete admin.password;

      return apiResponse.OK({ res, message: message.login_success || "Login successful", data: { admin, token } });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // send link to email
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const admin = await AdminModel.findOne({ email, deletedAt: null });
      if (!admin) {
        return apiResponse.NOT_FOUND({ res, message: message.email_not_found });
      }

      const token = generateToken({ userId: admin._id, email: admin.email });
      const resetLink = `${process.env.WEB_APP_URL}/reset-password/${token}`;
      const resetLinkExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now
      await AdminModel.findOneAndUpdate({ _id: admin._id, deletedAt: null }, { $set: { reset_link_expiry: resetLinkExpiry } }, { new: true });
      await sendEmail({
        to: email,
        // to: "mayurdodiya1234@gmail.com",
        subject: "Reset Your Password",
        text: `You requested to reset your password. Click this link: ${resetLink}`,
        html: sendResetPwdLink(resetLink),
      });

      return apiResponse.OK({ res, message: message.reset_password_link });
    } catch (error) {
      logger.error("Error in forgotPassword", error);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // only use for email reset link functionality
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      const admin = await AdminModel.findOne({ email: token.email, deletedAt: null });
      if (!admin) {
        return apiResponse.NOT_FOUND({ res, message: message.email_not_found });
      }

      if (admin.reset_link_expiry < new Date()) {
        return apiResponse.BAD_REQUEST({ res, message: message.reset_link_expired });
      }

      const hashPwd = await hashPassword({ password: password });

      await AdminModel.findOneAndUpdate({ _id: admin._id, deletedAt: null }, { $set: { password: hashPwd } }, { new: true });
      return apiResponse.OK({ res, message: message.password_reset });
    } catch (error) {
      logger.error("Error in resetPassword", error);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const admin = await AdminModel.findOne({ email: req.user.email, deletedAt: null });
      if (!admin) {
        return apiResponse.NOT_FOUND({ res, message: message.email_not_found });
      }

      const pwdMatch = await comparePassword({ password: oldPassword, hash: admin.password });
      if (!pwdMatch) {
        return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials || "Invalid credentials" });
      }

      const hashPwd = await hashPassword({ password: newPassword });

      await AdminModel.findOneAndUpdate({ _id: admin._id, deletedAt: null }, { $set: { password: hashPwd } }, { new: true });
      return apiResponse.OK({ res, message: message.password_reset });
    } catch (error) {
      logger.error("Error in changePassword", error);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editAdmin: async (req, res) => {
    try {
      const reqBody = req.body;
      const id = req.params.id;
      const data = await AdminModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.user_not_found,
        });
      }

      // email not change
      if (reqBody.email) {
        delete reqBody.email;
      }

      await AdminModel.findOneAndUpdate({ _id: data._id, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.updated}` });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await AdminModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.user_not_found,
        });
      }

      await AdminModel.findOneAndUpdate({ _id: data._id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.deleted}` });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAdmin: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await AdminModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.user_not_found,
        });
      }

      return apiResponse.OK({ res, message: `User ${message.data_get}`, data });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
};
