const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const meanSchema = new Schema(
  {
    name: String,
    sheet: String,
    image: String,
    color: String,
    pricePerHour: Number,
    additionalInfo: String,
    isInside: {
      type: Boolean,
      default: false,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.LEVEL,
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    meanType: {
      type: String,
      enum: [STRINGS.MEANTYPES.LIFTING, STRINGS.MEANTYPES.ROUTING],
    },
    location: [
      {
        deliveryArea: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.DELIVERYAREA,
        },
        storageArea: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.STORAGEAREA,
        },
        buildingId: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.BUILDING,
        },
        levelID: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.LEVEL,
        },
        locationType: {
          type: String,
          enum: [
            STRINGS.MEANLOCATIONTYPE.DELIVERYAREA,
            STRINGS.MEANLOCATIONTYPE.STORAGEAREA,
            STRINGS.MEANLOCATIONTYPE.LEVEL,
            STRINGS.MEANLOCATIONTYPE.EXTERIOR,
          ],
        },
        label: String,
      },
    ],
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
    status: {
      type: String,
      default: STRINGS.STATUS.AVAILABLE,
      enum: [STRINGS.STATUS.AVAILABLE, STRINGS.STATUS.UNAVAILABLE],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.MEAN, meanSchema);
