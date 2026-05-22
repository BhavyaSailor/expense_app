const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createTransaction,
  getTransactions,
  updateTransactions,
  deleteTransaction,
} = require("../controllers/transaction.controller");


router.post("/",auth , createTransaction)
router.get("/", auth, getTransactions)
router.put("/:id",auth, updateTransactions )
router.delete("/:id",auth, deleteTransaction )

module.exports = router;