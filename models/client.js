const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

const ClientSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.COMPANY,
    },
    adminIds: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.USER,
      },
    ],
    contractIds: [
      {
        type: Schema.Types.ObjectId,
        ref: STRINGS.MODALS.CONTRACT,
      },
    ],
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

ClientSchema.plugin(mongoosePaginate);
ClientSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model(STRINGS.MODALS.CLIENT, ClientSchema);
