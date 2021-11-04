const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const userSitesSchema = new Schema(
  {
    // May be redundant cause the user is related to a company in a site, not just a site
    userId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.USER,
    },
    sites: [
      {
        _id: false,
        siteId: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.SITE,
        },
        role: {
          type: String,
          enum: [
            STRINGS.ROLES.ADMIN,
            STRINGS.ROLES.TRAFFIC,
            STRINGS.ROLES.BUFFER,
            STRINGS.ROLES.ENTERPRISE,
          ],
        },
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.USERSITES, userSitesSchema);
