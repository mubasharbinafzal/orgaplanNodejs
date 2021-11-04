const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const STRINGS = require("../utils/texts");

const ContractSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: STRINGS.MODALS.COMPANY,
    },
    contractStartDate: {
      type: Date,
    },
    contractEndDate: {
      type: Date,
    },
    monthlyCost: {
      type: Number,
    },
    isPendingResponse: {
      type: Boolean,
      default: true,
    },
    additionalInfo: {
      type: String,
    },
    notificationPriorToDays: {
      type: Number,
    },
    notificationTo: [
      {
        type: String,
      },
    ],
    functionality: {
      type: String,
      enum: [STRINGS.FUNCTIONALITY.DELIVERY],
    },
    contractType: {
      type: String,
      enum: [
        STRINGS.CONTRACTTYPES.CLIENTPERSITE,
        STRINGS.CONTRACTTYPES.MASTERCLIENT,
      ],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(STRINGS.MODALS.CONTRACT, ContractSchema);
