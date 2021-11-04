const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: STRINGS.MODALS.USER,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 86400,
  },
});

module.exports = mongoose.model(STRINGS.MODALS.TOKEN, tokenSchema);
