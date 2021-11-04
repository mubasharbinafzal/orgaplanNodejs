const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const siteCompaniesSchema = new Schema(
  {
    siteId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.SITE,
    },
    users: [
      {
        _id: false,
        userId: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.USER,
        },
        companyId: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.COMPANY,
        },
        role: {
          type: String,
          enum: [
            STRINGS.ROLES.ADMIN,
            STRINGS.ROLES.ENTERPRISE,
            STRINGS.ROLES.TRAFFIC,
            STRINGS.ROLES.BUFFER,
          ],
          required: true,
        },
      },
    ],
    companies: [
      {
        _id: false,
        color: String,
        companyId: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.COMPANY,
        },
        parentCompanyId: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.COMPANY,
        },
        trades: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model(
  STRINGS.MODALS.SITECOMPANIES,
  siteCompaniesSchema
);
