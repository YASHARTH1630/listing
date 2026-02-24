const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review.js"); //wahi naam jo export main h
const User = require("./user.js");
const listSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    location: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://images.unsplash.com/..."
        }
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review" //wahi naam jo export main likha h
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    price: Number,
    country: String
});
//below one is created to delete review too with deletion of list 
listSchema.post("findOneAndDelete", async(listing) => { //mongodb middleWare 
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});
const List = mongoose.models.List || mongoose.model("List", listSchema);

module.exports = mongoose.model("List", listSchema);