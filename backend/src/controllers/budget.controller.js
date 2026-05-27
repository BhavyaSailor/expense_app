const Budget = require("../models/budget.model");
const Tx = require("../models/transaction.model");
const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "all fields required",
      });
    }

    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year,
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this year",
      });
    }

    const budget = await Budget.create({
      category: category.trim(),
      limit,
      month,
      year,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      budget,
    });
  } catch (error) {
    next(error);
  }
};

const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
    });

    if (!budgets) {
      return res.status(404).json({
        success: false,
        message: "BKL budget tera baap banayega",
      });
    }
    res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        sucess: false,
        messaage: "Budget doesn't exist",
      });
    }

    budget.category = req.body.category || budget.category;
    budget.limit = req.body.limit || budget.limit;
    budget.year = req.body.year || budget.year;
    budget.month = req.body.month || budget.month;
    await budget.save();

    res.status(200).json({
      success: true,
      message: "budget updated",
      budget,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        sucess: false,
        messaage: "Budget doesn't exist",
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: "deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getBudgetSummary = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id
    });

    const summary = [];

    for (const budget of budgets) {
      const transactions = await Tx.find({
        user: req.user.id,
        type: "expense",
        category: budget.category,
      });

      let spent = 0;

      transactions.forEach((tx) => {
        spent += tx.amount;
      });

      const remaining = budget.limit - spent;

      const percentageUsed = (spent / budget.limit) * 100;

      summary.push({
        category: budget.category,
        limit: budget.limit,
        spent,
        remaining,
        percentageUsed: Number(percentageUsed.toFixed(2)),
        status: spent > budget.limit ? "exceeded" : "Within Budget",
      });
    }
      res.status(200).json({
        success: true,
        summary,
      });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
};
