const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const adminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      trim: true,
      default: null,
    },
    reset_link_expiry: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🔥 Pre Hook - Hash password before save
adminSchema.pre("save", async function (next) {
  const admin = this;
  if (admin.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
