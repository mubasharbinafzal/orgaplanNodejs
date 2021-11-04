const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const invoiceSchema = new Schema({
  name: String,
  date: Date,
  time: String,
  location: String,
  price: Number,
  status: {
    type: String,
    enum: [STRINGS.STATUS.PAID, STRINGS.STATUS.UNPAID],
    default: STRINGS.STATUS.PAID,
  },
  invoiceType: {
    type: String,
    enum: [
      STRINGS.INVOICETYPES.WAYS,
      STRINGS.INVOICETYPES.DELAY,
      STRINGS.INVOICETYPES.INCIDENT,
      STRINGS.INVOICETYPES.UNPLANNEDDELIVERY,
    ],
    default: STRINGS.INVOICETYPES.DELAY,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: STRINGS.MODALS.USER,
  },
  information: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.USER,
      },
      userName: String,
      images: [{ type: String }],
      site: {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.SITE,
      },
      enterprise: {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.USER,
      },
      comments: [
        {
          comment: String,
          userId: {
            type: Schema.Types.ObjectId,
            ref: STRINGS.MODALS.USER,
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model(STRINGS.MODALS.INVOICE, invoiceSchema);
