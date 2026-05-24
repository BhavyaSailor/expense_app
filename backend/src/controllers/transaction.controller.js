const Tx = require("../models/transaction.model");

const createTransaction = async (req, res, next) => {
  try {
    const { name, amount, type, category, notes, date } = req.body;

    if (!name || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: "name, amount and type are required",
      });
    }
    const foramttedName = name.trim();
    const formattedType = type.toLowerCase().trim();
    const formattedCategory = category ? category.trim() : undefined;

    if (!Number(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be greater than 0",
      });
    }

    if (formattedType !== "income" && formattedType !== "expense") {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense ",
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
    const filter = {
      user: req.user.id,
    };

    //filter by type
    if(req.query.type){
      filter.type = req.query.type
    }

    //search
    if(req.query.search) {
      filter.$or = [
        {
          name: {
            $regex: req.query.search,
            $options : "i"
          }
        },
        {
          category: {
            $regex: req.query.search,
            $options : "i"
          }
        },
        {
          notes: {
            $regex: req.query.search,
            $options : "i"
          }
        },
        {
          type: {
            $regex: req.query.search,
            $options: 'i'
          }
        }
      ]
    }


    //sort
    const allowedSort = ["createdAt", "-createdAt", "amount", "-amount"]
    const sortBy = allowedSort.includes(req.query.sortBy)? req.query.sortBy : "-createdAt;"

    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1 ) * limit;
    
    const transactions = await Tx.find(filter).select("-__v")
    .sort(sortBy).skip(skip).limit(limit);

    const totalTransactions = await Tx.countDocuments(filter)

    res.status(200).json({
      success: true,
      totalTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions/ limit),
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

    transaction.name = req.body.name || transaction.name;
    transaction.amount = req.body.amount || transaction.amount;
    transaction.category = req.body.category || transaction.category;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "task updated",
      transaction,
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
      message: "deleted successfully",
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
