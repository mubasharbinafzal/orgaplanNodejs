const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const deliverySchema = new Schema(
  {
    type: {
      type: String,
      enum: [STRINGS.STATUS.SCHEDULED, STRINGS.STATUS.UNSCHEDULED],
      default: STRINGS.STATUS.SCHEDULED,
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.COMPANY,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.USER,
    },
    deliveryArea: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.DELIVERYAREA,
    },
    storageArea: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.STORAGEAREA,
    },
    comment: String,
    sendDeliverySummary: Boolean,
    userEmail: String,
    trades: [String],
    materials: [String],
    materialsDelivered: [String],
    liftingMeans: [{ type: Schema.Types.ObjectId, ref: STRINGS.MODALS.MEAN }],
    routingMeans: [{ type: Schema.Types.ObjectId, ref: STRINGS.MODALS.MEAN }],
    building: { type: Schema.Types.ObjectId, ref: STRINGS.MODALS.BUILDING },
    level: { type: Schema.Types.ObjectId, ref: STRINGS.MODALS.LEVEL },
    date: Date,
    startTime: String,
    endTime: String,
    bufferArea: Boolean,
    arrivalTime: Date,
    departureTIme: Date,
    flatRegistration: String,
    status: {
      type: String,
      enum: [
        STRINGS.STATUS.PENDING,
        STRINGS.STATUS.MODIFIED,
        STRINGS.STATUS.VALIDATED,
        STRINGS.STATUS.COMPLETED,
        STRINGS.STATUS.COMPLETEDWITHISSUE,
      ],
      default: STRINGS.STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.DELIVERY, deliverySchema);
