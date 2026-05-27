const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const{
   getDashboard,
   getCategories,
   getMonthly
} = require("../controllers/dashboard.controller")

router.get("/",auth, getDashboard);
router.get("/monthly",auth, getMonthly);
router.get("/category",auth, getCategories);

module.exports = router;