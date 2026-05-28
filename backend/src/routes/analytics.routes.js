const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware")
const {
    getMonthlyAnalytics,
    getCategoryAnalytics,
    getRecentExpense,
    getTopCategory

} = require("../controllers/analytics.controller");

router.get("/monthly", auth, getMonthlyAnalytics );
router.get("/category", auth, getCategoryAnalytics );
router.get("/recent", auth, getRecentExpense );
router.get("/top", auth, getTopCategory );

module.exports = router;