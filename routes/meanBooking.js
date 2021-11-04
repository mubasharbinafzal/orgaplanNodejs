const router = require("express").Router();
const auth = require("../middlewares/auth");
const meanBookingController = require("../controllers/meanBooking");
// GETS
router.get("/", auth(), meanBookingController.getAll);
router.get("/getValidatedMean", meanBookingController.validatedMean);
router.get("/:id", auth(), meanBookingController.getOne);

router.get(
  "/getBookingBySiteId/:siteId",
  auth(),
  meanBookingController.getBookingBySiteId
);
router.get("/:meanId/:siteId", auth(), meanBookingController.getHistory);
router.get(
  "/get_mean_bookings_calendar/:siteId/:meanId",
  meanBookingController.getMeanCalendar
);
// POSTS
router.post("/", auth(), meanBookingController.create);
router.post("/filter", meanBookingController.filterHistory);
router.post("/filter_calendar", meanBookingController.filterBookingCalendar);
router.post(
  "/filter_Booking_calendar",
  meanBookingController.filterBookingCalendar
);

// POSTS
router.post("/", auth(), meanBookingController.create);
// PUTS
router.put("/:id", meanBookingController.update);
router.put("/updateStatus/:id", meanBookingController.updateStatus);
// DELETES
router.delete("/:id", meanBookingController.delete);
module.exports = router;
