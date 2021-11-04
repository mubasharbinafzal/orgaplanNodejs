const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const zacSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sites: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.SITE,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.ZAC, zacSchema);
