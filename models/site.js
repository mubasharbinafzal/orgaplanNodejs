const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const siteSchema = new Schema(
  {
    name: String,
    logo: String,
    plan: String,
    zacId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.ZAC,
    },
    clientAdmin: [
      {
        _id: false,
        adminId: { type: Schema.Types.ObjectId, ref: STRINGS.MODALS.USER },
        clientId: { type: Schema.Types.ObjectId, ref: STRINGS.MODALS.CLIENT },
      },
    ],

    functionality: {
      type: String,
      enum: [STRINGS.FUNCTIONALITY.DELIVERY],
    },
    addresses: [
      {
        street: String,
        city: String,
        postal: String,
      },
    ],
    trades: [{ type: String }],
    penaltyforLateDelivery: Number,
    penaltyforUnexpDelivery: Number,
    start: Date,
    end: Date,
    openingHours: [
      {
        day: Number,
        startHour: Number,
        endHour: Number,
        dayOff: { type: Boolean, default: false },
      },
    ],
    unavailabilityDates: [
      {
        date: Date,
        startHour: Number,
        endHour: Number,
        dayOff: { type: Boolean, default: false },
        reason: String,
      },
    ],
    additionalInfo: String,
    notificationPriorToDays: Number,
    notificationTo: [{ type: String }],
    // buildings: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: STRINGS.MODALS.BUILDING,
    //   },
    // ],
    // means: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: STRINGS.MODALS.MEAN,
    //   },
    // ],
    status: {
      type: String,
      enum: [
        STRINGS.STATUS.ACTIVE,
        STRINGS.STATUS.DELETED,
        STRINGS.STATUS.ARCHIVED,
        STRINGS.STATUS.INACTIVE,
        STRINGS.STATUS.COMPLETED,
        STRINGS.STATUS.UNAVAILABLE,
      ],
      default: STRINGS.STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.SITE, siteSchema);
