const mongoose = require("mongoose");

const requestItemSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    content: {
      serviceName: {
        type: String,
        default: "",
      },

      videoUrl: {
        type: String,
        default: "",
      },

      files: {
        type: [String],
        default: [],
      },
    },

    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  }
);

const requestContentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    requests: {
      type: [requestItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RequestContent",
  requestContentSchema
);