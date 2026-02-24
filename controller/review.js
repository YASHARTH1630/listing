const List = require("../models/listing.js");
const Review = require("../models/review.js");
module.exports.reviewPost = async(req, res) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must Be Logged In ");
        return res.redirect("/signup/login");
    }
    let listing = await List.findById(req.params.id);
    let newReview = new Review(req.body.review);
    let { id } = req.params;
    newReview.author = req.user;
    listing.reviews.push(newReview); 
    await newReview.save();
    await listing.save();
    console.log("new review added");
    res.redirect(`/listing/${id}`);
};
module.exports.reviewDelete = async(req, res) => {
    if (!req.isAuthenticated()) { //authenciate
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must Be Logged In ");
        return res.redirect("/signup/login");
    }
    let { id, reviewid } = req.params;
    let CS = req.user;

    // debug
    let review = await Review.findById(reviewid);
    console.log(review);
    if (!review.author._id.equals(CS._id)) { //only author can change this ,not for hoppscoth too
        req.flash("error", "YOUR ARE NOT AUTHOR OF THIS REVIEW");
        return res.redirect("/listing/${id}"); //return otherwise niceh wale code run krjayega
    }
    await List.findByIdAndUpdate(id, { $pull: { reviews: reviewid } }); //pull request use to delete from list too //jo name "reviews" likha h na list ke scheme main
    await Review.findByIdAndDelete(reviewid); //uppercase use kiya

    res.redirect(`/listing/${id}`);
};
