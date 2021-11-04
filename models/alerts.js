const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const alertSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.USER,
    },
    createdFor: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.USER,
      },
    ],
    reason: String,
    location: String, // Question
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.ALERT, alertSchema);
