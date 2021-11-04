const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const incidentSchema = new Schema(
  {
    name: String,
    date: Date,
    time: String,
    price: Number,
    comment: String,
    document: String,
    isBillable: Boolean,
    isPaid: Boolean,
    description: String,
    photos: [{ type: String }],
    location: {
      deliveryArea: {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.DELIVERYAREA,
      },
      storageArea: {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.STORAGEAREA,
      },
      level: {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.LEVEL,
      },
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.COMPANY,
    },
    type: {
      type: String,
      enum: [
        STRINGS.INCIDENTTYPE.MEAN,
        STRINGS.INCIDENTTYPE.DELAY,
        STRINGS.INCIDENTTYPE.INCIDENT,
        STRINGS.INCIDENTTYPE.UNEXPRECTED,
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [STRINGS.INCIDENTSTATUS.OPEN, STRINGS.INCIDENTSTATUS.CLOSED],
      default: STRINGS.INCIDENTSTATUS.OPEN,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.INCIDENT, incidentSchema);
