const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const levelSchema = new Schema(
  {
    plan: String,
    name: String,
    number: String,
    building: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.BUILDING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.LEVEL, levelSchema);
