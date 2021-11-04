const router = require("express").Router();

const auth = require("../middlewares/auth");
const incidentsController = require("../controllers/incidents");
const multer = require("../middlewares/multer");

// GETS
router.get("/", incidentsController.getAll);
router.get("/:id", auth(), incidentsController.getOne);

router.get("/admin/:siteId", incidentsController.getIncidentAdmin);
router.get("/admin/incident_list/:id", incidentsController.getIncidentList);

router.get("/incidents_list/:siteId", incidentsController.getIncidentsList);

// POSTS
router.post(
  "/",
  multer("incidents", "photos", "single"),
  incidentsController.create
);

// PUTS
router.put(
  "/:id",
  multer("incidents", "photos", "single"),
  incidentsController.update
);
// DELETES
router.delete("/:id", auth(), incidentsController.delete);

router.post("/filter", incidentsController.filterIncidents);

module.exports = router;
