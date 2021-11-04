const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const QuoteSchema = new Schema(
  {
    // companyName: String,
    // firstName: {
    //   type: String,
    // },
    // lastName: {
    //   type: String,
    // },
    // email: {
    //   type: String,
    // },
    // phone: {
    //   type: Number,
    // },
    // description: {
    //   type: String,
    // },
    // isPendingResponse: {
    //   type: Boolean,
    //   default: true,
    // },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.QUOTE, QuoteSchema);
