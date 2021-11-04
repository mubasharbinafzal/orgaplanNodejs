const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const storageAreaRequestSchema = new Schema(
  {
    requestDate: Date,
    userId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.USER,
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.COMPANY,
    },
    storageAreaId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.STORAGEAREA,
    },
    status: {
      type: String,
      enum: [
        STRINGS.STORAGEAREAREQUESTSTATUS.ACCEPTED,
        STRINGS.STORAGEAREAREQUESTSTATUS.PENDING,
        STRINGS.STORAGEAREAREQUESTSTATUS.REJECTED,
      ],
      default: STRINGS.STORAGEAREAREQUESTSTATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  STRINGS.MODALS.STORAGEAREAREQUEST,
  storageAreaRequestSchema
);
