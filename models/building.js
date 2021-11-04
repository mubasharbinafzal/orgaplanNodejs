const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const buildingSchema = new Schema(
  {
    name: String,
    start: Date,
    end: Date,
    color: String,
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    levels: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.LEVEL,
      },
    ],
    status: {
      type: String,
      enum: [STRINGS.STATUS.ACTIVE, STRINGS.STATUS.INACTIVE],
      default: STRINGS.STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.BUILDING, buildingSchema);
