const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  name:{
    type: String,
    required : true
  } ,
  amount: {
    type: Number,
    required: true
  },
  type:{
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  category: String,
  notes: String,
  date:{
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "User"
  }
  
},
{
  timestamps: true
}
);


module.exports = mongoose.model("Transactions", transactionSchema);