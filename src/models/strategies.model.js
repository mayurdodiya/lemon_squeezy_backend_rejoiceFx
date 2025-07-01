const mongoose = require("mongoose");

const strategiesSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: null,
    },
    slug: {
      type: String,
      trim: true,
      default: null,
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
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


const Strategies = mongoose.model("Strategies", strategiesSchema);
module.exports = Strategies;
