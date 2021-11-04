const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const historySchema = new Schema(
  {
    name: String,
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    BuildingId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.BUILDING,
    },
    LevelId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.LEVEL,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.HISTORY, historySchema);
