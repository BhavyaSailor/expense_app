const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const { exportPDF } = require("../controllers/export.controller");

router.get("/pdf", auth, exportPDF);

module.exports = router;