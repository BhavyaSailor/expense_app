const mongoose= require('mongoose');

const budgetSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true
        },
        limit: {
            type: Number,
            required: true,
            min: 1
        },
        month: {
            type: Number,
            required: true
        },
        year:{
            type: Number,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true
        }

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Budget", budgetSchema);