const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const{
    createBudget,
    getBudgets,
    getBudgetSummary,
    updateBudget,
    deleteBudget
} = require("../controllers/budget.controller")

router.post('/', auth, createBudget);
router.get('/', auth, getBudgets);
router.get('/summary', auth, getBudgetSummary);
router.delete('/:id', auth, deleteBudget);
router.put('/:id', auth, updateBudget);

module.exports = router;