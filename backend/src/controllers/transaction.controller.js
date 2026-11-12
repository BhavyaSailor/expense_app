const Tx = require("../models/transaction.model");

const createTransaction = async (req, res, next) => {
  try {
    const { name, amount, type, category, notes, date } = req.body;

    if (!name || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "name, amount, type and category are required",
      }); 
    }
    const foramttedName = name.trim();
    const formattedType = type.toLowerCase().trim();
    const formattedCategory = category ? category.toLowerCase().trim() : undefined;

    if (!Number(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    if (formattedType !== "income" && formattedType !== "expense" && formattedType !== "savings") {
      return res.status(400).json({
        success: false,
        message: "Type must be income, expense or savings",
      });
    }

    const tranx = await Tx.create({
      name: foramttedName,
      amount,
      type: formattedType,
      category: formattedCategory,
      notes,
      date,
      user: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: "transaction creaeted Successfully",
      transaction: tranx,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const filters = [{ user: req.user.id }];

    if (req.query.type) {
      filters.push({ type: req.query.type.trim().toLowerCase() });
    }

    if (req.query.category) {
      filters.push({ category: req.query.category.trim().toLowerCase() });
    }

    if (req.query.startDate || req.query.endDate) {
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
      const range = {};

      if (startDate && !Number.isNaN(startDate.getTime())) {
        range.$gte = startDate;
      }
      if (endDate && !Number.isNaN(endDate.getTime())) {
        endDate.setHours(23, 59, 59, 999);
        range.$lte = endDate;
      }

      if (Object.keys(range).length > 0) {
        filters.push({
          $or: [
            { date: range },
            { createdAt: range },
          ],
        });
      }
    }

    if (req.query.search) {
      filters.push({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { category: { $regex: req.query.search, $options: 'i' } },
          { notes: { $regex: req.query.search, $options: 'i' } },
          { type: { $regex: req.query.search, $options: 'i' } },
        ],
      });
    }

    const filter = filters.length > 0 ? { $and: filters } : {};

    const allowedSort = ['createdAt', '-createdAt', 'amount', '-amount', 'date', '-date'];
    const sortBy = allowedSort.includes(req.query.sortBy) ? req.query.sortBy : '-createdAt';

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const transactions = await Tx.find(filter).select('-__v')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Tx.countDocuments(filter);

    res.status(200).json({
      success: true,
      totalTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

const updateTransactions = async (req, res, next) => {
  try {
    const transaction = await Tx.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        sucess: false,
        message: "Transcation doesn't exist",
      });
    }

    if (req.body.name) {
      transaction.name = req.body.name.toLowerCase().trim();
    }

    if (req.body.amount !== undefined) {
      transaction.amount = req.body.amount;
    }

    if (req.body.category) {
      transaction.category = req.body.category.toLowerCase().trim();
    }
    if (req.body.notes) {
      transaction.notes = req.body.notes.toLowerCase().trim();
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "transaction updated",
      transaction
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Tx.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!transaction) {
      return res.status(404).json({
        sucess: false,
        message: "Transcation doesn't exist",
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: "transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransactions,
  deleteTransaction,
};
