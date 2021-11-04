const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    password: String,
    image: String,
    phone: String,
    email: {
      type: String,
      trim: true,
    },
    address: {
      zip: String,
      city: String,
      street: String,
      country: String,
      // [long, lat]
      location: [{ type: Number }],
    },
    // Only one company per user allowed
    company: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.COMPANY,
    },
    adminType: {
      type: String,
      enum: [
        STRINGS.ROLES.MASTERADMIN,
        STRINGS.ROLES.ADMINPERSITE,
        STRINGS.ROLES.NOADMIN,
      ],
      default: STRINGS.ROLES.NOADMIN,
    },
    role: {
      type: String,
      enum: [STRINGS.ROLES.USER, STRINGS.ROLES.SUPERADMIN],
      default: STRINGS.ROLES.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        STRINGS.STATUS.ACTIVE,
        STRINGS.STATUS.INACTIVE,
        STRINGS.STATUS.DELETED,
      ],
      default: STRINGS.STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.USER, userSchema);
