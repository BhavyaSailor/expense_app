const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
    createGoal,
    getGoals,
    contributeGoal,
    deleteGoal
} = require("../controllers/goal.controller");

router.post("/", auth, createGoal);
router.get("/", auth, getGoals);
router.post("/:id/contribute", auth, contributeGoal);
router.delete("/:id", auth, deleteGoal);

module.exports = router;
