const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const organigrammeSchema = new Schema({
  type: {
    type: String,
    enum: [STRINGS.ORGANIGRAMMETYPE.LOGISTICS, STRINGS.ORGANIGRAMMETYPE.SITE],
  },
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  image: String,
  company: String,
  role: String,
  siteId: {
    type: Schema.Types.ObjectId,
    ref: STRINGS.MODALS.SITE,
  },
});

module.exports = mongoose.model(
  STRINGS.MODALS.ORGANIGRAMME,
  organigrammeSchema
);
