const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const storageArea = new Schema(
  {
    name: String,
    color: String,
    isInside: {
      type: Boolean,
      default: false,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.LEVEL,
    },
    isFull: {
      type: Boolean,
      default: false,
    },
    availability: {
      start: Date,
      end: Date,
    },
    unavailability: [
      {
        date: Date,
        reason: String,
        startHour: Number,
        endHour: Number,
        dayOff: { type: Boolean, default: false },
      },
    ],
    materials: [{ type: String }],
    notificationPriorToDays: Number,
    notificationTo: [{ type: String }],
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    deliveryArea: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.DELIVERYAREA,
      },
    ],
    companies: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.COMPANY,
      },
    ],
    status: {
      type: String,
      enum: [STRINGS.STATUS.AVAILABLE, STRINGS.STATUS.UNAVAILABLE],
      default: STRINGS.STATUS.AVAILABLE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.STORAGEAREA, storageArea);
