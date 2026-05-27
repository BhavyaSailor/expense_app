const Tx = require("../models/transaction.model");

const getDashboard = async (req, res, next) => {
  try{

    const income = await Tx.aggregate([
      {
        $match :{
          user: req.user._id,
          type: "income"
        }
      },
      {
        $group:{
          _id: null, 
          total : { $sum: "$amount" }
        }
      }
    ]);
    

    const expense = await Tx.aggregate([
      {
        $match :{
          user: req.user._id,
          type: "expense"
        }
      },
      {
        $group:{
          _id: null, 
          total : { $sum: "$amount" }
        }
      }
    ]);
   
    const totalIncome = income[0]?.total || 0;
    const totalExpense = expense[0]?.total || 0;

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      totalIncome,
      totalExpense,
      balance
    });
  } 
  catch(error) {
    next(error);
  }
}

const getMonthly = async(req, res, next) =>{
    try{
        const month = await Tx.aggregate([
            {
                $match:{
                    user: req.user._id,
                    type: "expense"
                }
            },
            {
                $group : {
                    _id: {$month : "$createdAt" },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: {_id: 1}
            },
           
        ]);
          res.status(200).json({
            success: true,
            month
        })
    }
    catch(error){
        next(error);
    }
}

const getCategories = async(req, res, next) =>{
    try{
        const category = await Tx.aggregate([
            {
                $match:{
                    user: req.user._id,
                    type: "expense"
                }
            },
            {
                $group : {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: {total: -1}
            },
             {
              $project: {
                _id: 0,
                category: "$_id",
                totalSpent: "$total"
              }
            }
        ]);
        res.status(200).json({
            success: true,
            category
        })
    }
    catch(error){
        next(error);
    }
}

module.exports = {getDashboard, getCategories, getMonthly};