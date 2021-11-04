const router = require("express").Router();
const auth = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const companyController = require("../controllers/company");

// GETS
router.get("/", auth(), companyController.getAll);
router.get("/:id", auth(), companyController.getOne);
router.get("/site/:siteId", companyController.getBySite);
router.get("/site-exclude/:siteId", companyController.getNonSite);
router.get("/user/:siteId/:userId", companyController.getUserCompany);
router.get("/admin/:adminId", companyController.getAdminCompany);
router.get(
  "/users/:siteId/:companyId",
  companyController.getCompanyUsersPerSite
);

// POSTS
router.post("/", upload("company", "logo"), companyController.create);
router.post(
  "/add_user",
  auth(),
  upload("user", "image"),
  companyController.addUser
);

router.post("/filter", companyController.filterCompanies);
router.post(
  "/add_companiesData/:companyId",
  upload("company", "companiesdata"),
  companyController.UploadCompaniesUserData
);

// PUTS
router.put("/:id", auth(), companyController.update);

// DELETES
router.delete("/:id", auth(), companyController.delete);

module.exports = router;
