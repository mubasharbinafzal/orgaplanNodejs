const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const companySchema = new Schema(
  {
    logo: String,
    name: String,
    city: String,
    color: String,
    website: String,
    description: String,
    companiesdata: String,
    incharge: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
    },
    quoteVerified: {
      type: Boolean,
      default: false,
    },
    // Multiple Admins for a company/client
    adminIds: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.USER,
      },
    ],
    type: {
      type: String,
      enum: [
        STRINGS.COMPANYTYPE.CLIENTPERSITE,
        STRINGS.COMPANYTYPE.MASTERCLIENT,
        STRINGS.COMPANYTYPE.NOCLIENTS,
      ],
      default: STRINGS.COMPANYTYPE.NOCLIENTS,
    },
    status: {
      type: String,
      enum: [
        STRINGS.STATUS.ACTIVE,
        STRINGS.STATUS.DELETED,
        STRINGS.STATUS.INACTIVE,
      ],
      default: STRINGS.STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.COMPANY, companySchema);
