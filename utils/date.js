const moment = require("moment");
const STRINGS = require("../utils/texts");
const CustomError = require("../utils/customError");

function isDateOccuranceChronological(startDate, endDate) {
  const today = moment();
  if (moment(startDate).isBefore(today, "day"))
    throw new CustomError(STRINGS.ERRORS.startDateCannotBeFromPast);
  if (moment(endDate).isBefore(today, "day"))
    throw new CustomError(STRINGS.ERRORS.endDateCannotBeFromPast);
  if (moment(endDate).isBefore(startDate, "day"))
    throw new CustomError(STRINGS.ERRORS.endDateShouldBeAfeterStartDate);
  if (moment(startDate).isAfter(endDate, "day"))
    throw new CustomError(STRINGS.ERRORS.startDateShoudBeBeforeEndDate);
  if (moment(startDate).isSame(endDate, "day"))
    throw new CustomError(STRINGS.ERRORS.endDateShouldBeAfeterStartDate);

  return true;
}
module.exports = isDateOccuranceChronological;
