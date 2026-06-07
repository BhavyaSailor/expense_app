const Tx = require("../models/transaction.model");
const Goal = require("../models/goal.model");

const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Name and target Amount required",
      });
    }
    const formattedName = name.trim();

    if (!Number(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount should be more than zero",
      });
    }
    if (targetDate && isNaN(new Date(targetDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid target date",
      });
    }

    const existingGoal = await Goal.findOne({
      user: req.user._id,
      name: formattedName,
    });
    if (existingGoal) {
      return res.status(400).json({
        success: false,
        message: "Goal already exists",
      });
    }
    const goal = await Goal.create({
      name: formattedName,
      targetAmount,
      targetDate,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      goal,
    });
  } catch (error) {
    next(error);
  }
};

const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({
      user: req.user._id,
    });
    const formattedGoals = goals.map((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const status =
        goal.currentAmount >= goal.targetAmount ? "Completed" : "IN progress";

      return {
        ...goal.toObject(),
        progress: Number(progress.toFixed(2)),
        remaining,
        status,
      };
    });

    res.status(200).json({
      success: true,
      goals: formattedGoals,
    });
  } catch (error) {
    next(error);
  }
};

const contributeGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      user: req.user._id,
      _id: req.params.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal doesnt exist",
      });
    }

    if (goal.currentAmount >= goal.targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Goal already completed",
      });
    }
    
    const contribution = Number(req.body.contribution);
    if (!contribution || contribution <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    const amountNeeded = goal.targetAmount - goal.currentAmount;
    const excessAmount = Math.max(contribution - amountNeeded, 0);

    goal.currentAmount = Math.min(
      goal.currentAmount + contribution, goal.targetAmount,
    );

    await goal.save();
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    res.status(200).json({
      success: true,
      message: "contribution Added",
      goal: {
        ...goal.toObject(),
        progress: Number(progress.toFixed(2)),
        remaining: goal.targetAmount - goal.currentAmount,
        excessAmount,
        status:
          goal.currentAmount >= goal.targetAmount ? "Completed" : "In Progress",
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal doesnt exist",
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Goal deleted",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createGoal,
  getGoals,
  contributeGoal,
  deleteGoal,
};
