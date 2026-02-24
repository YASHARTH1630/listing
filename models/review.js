const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const User = require("./user.js");
const reviewSchema = new mongoose.Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});
module.exports = mongoose.model("Review", reviewSchema);