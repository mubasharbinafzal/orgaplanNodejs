const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const levelPicSchema = new Schema(
  {
    levelId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.LEVEL,
    },
    shapes: [
      {
        type: {
          type: String,
          enum: ["MEAN", "STORAGEAREA"],
          required: true,
        },
        _id: String,
        color: String,
        name: String,
        opacity: Number,
        image: String,
        points: [],
        mean: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.MEAN,
        },
        storageArea: {
          type: Schema.Types.ObjectId,
          ref: STRINGS.MODALS.STORAGEAREA,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.LEVELPIC, levelPicSchema);
