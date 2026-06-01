const Tx = require("../models/transaction.model");

const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const analytics = await Tx.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryAnalytics = async (req, res, next) => {
  try {
    const category = await Tx.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalSpent: "$total",
        },
      },
    ]);
    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const getRecentExpense = async (req, res, next) => {
  try {
    const recent = await Tx.find({
      user: req.user._id,
      type: "expense",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-__v");

    res.status(200).json({
      sucess: true,
      recent,
    });
  } catch (error) {
    next(error);
  }
};

const getTopCategory = async (req, res, next) => {
  try {
    const topCategory = await Tx.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    res.status(200).json({
      success: true,
      topCategory: topCategory[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const totalTransactions = await Tx.countDocuments({
      user: req.user._id,
    });

    const income = await Tx.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "income",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const expense = await Tx.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" },
          averageExpense: { $avg: "$amount" },
          highestExpense: { $max: "$amount" },
        },
      },
    ]);

    const stats = {
      totalTransactions,
      totalIncome: income[0]?.total || 0,
      totalExpense: expense[0]?.totalExpense || 0,
      averageExpense: Number(expense[0]?.averageExpense?.toFixed(2) || 0),
      highestExpense: expense[0]?.highestExpense || 0,
    };
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

const getDailyAnalytics = async (req, res, next) => {
  try {
    const daily = await Tx.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y - %m - %d",
              date: "$createdAt",
            },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      daily,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getRecentExpense,
  getTopCategory,
  getStats,
  getDailyAnalytics,
};
