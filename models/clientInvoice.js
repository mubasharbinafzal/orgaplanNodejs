const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const clientInvoiceSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.CLIENT,
    },
    file: String,
    startDate: Date,
    endDate: Date,
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    amount: { type: Number, default: 0 },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [STRINGS.STATUS.PAID, STRINGS.STATUS.UNPAID],
      default: STRINGS.STATUS.PAID,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  STRINGS.MODALS.CLIENTINVOICE,
  clientInvoiceSchema
);
