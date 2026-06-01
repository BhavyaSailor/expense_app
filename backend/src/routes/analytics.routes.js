const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware")
const {
    getMonthlyAnalytics,
    getCategoryAnalytics,
    getRecentExpense,
    getTopCategory,
    getStats,
    getDailyAnalytics
} = require("../controllers/analytics.controller");

router.get("/monthly", auth, getMonthlyAnalytics );
router.get("/category", auth, getCategoryAnalytics );
router.get("/recent", auth, getRecentExpense );
router.get("/top", auth, getTopCategory );
router.get("/stats", auth, getStats );
router.get("/daily", auth, getDailyAnalytics );

module.exports = router;