const List = require("../models/listing.js");

module.exports.index = async(req, res) => {
    let sortOption = {};
    console.log("QUERY ", req.query);
    if (req.query.sort === "price_asc") {
        sortOption = { price: 1 }; 
    } else if (req.query.sort === "price_desc") {
        sortOption = { price: -1 };
    }
    let query = {};

    if (req.query.search) {
        query.title = { $regex: req.query.search, $options: "i" }; //regex for all content containing that given text and option in all for case(uppeer,lower)
        const listings = await List.find(query);
        return res.render("data", { listings });
    }

    const listings = await List.find({}).sort(sortOption);
    res.render("data", { listings });
};

module.exports.eachList = async(req, res) => {
    let { id } = req.params;
    let item = await List.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author" //nested populate
        },
    }).populate("owner"); //jo naam scehma main h 

    if (!item) {
        req.flash("error", "NOT FOUND!");
        res.redirect("/listening");
    } //taki reviews k pura detail aaye n ki sirf id
    console.log(item.owner);
    let CS = req.user;
    console.log(CS);
    res.render("view_item", { item });
};
module.exports.renderNewForm = (req, res) => { //get  foor post new list
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; //original current site url contain 
        req.flash("error", "you must be logged in ");
        return res.redirect("/signup/login");
    }
    console.log("creating new place");
    res.render("edit");
};
module.exports.postingList = async(req, res) => {
    console.log(req.file);
    if (!req.file) {
        req.flash("error", "Image is required");
        return res.redirect('/listening');
    };
    console.log("POST BODY 👉", req.body); // optional debug
    //bkl listing[] daalna k kro jb bhi validate use krna usko listing in frontend: krke naam krna hota h when he get req.body 
    const newListing = new List(req.body.listing); // ✅ CORRECT , aise kra kr yeh bhi important hain whne use validate 
    //2️⃣ownner of list set here
    newListing.owner = req.user._id; //owner jisne create kiya uski id print store ismein
    //3️⃣abhi tk image mai url and file name de rhe ,now hm image upload krege toh joi klo validate krne k liye ek fake data bna rhe h
    newListing.image = {
        url: /* `/uploads/${req.file.filename}*/ req.file.path, // 4️⃣ Mongo save this at that end overwrite fake data ,which was to validate joi
        filename: req.file.filename // cloudinary -> req.file.path / secure_url
    };

    console.log(newListing.owner);
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listening");
};
module.exports.editEachList = async(req, res) => { //patch ke liye get 
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must Be Logged In ");
        return res.redirect("/signup/login");
    } //add this if require user to login before doing any task and you can create a middleware like validateListing
    let { id } = req.params;
    let listing = await List.findById(id);
    res.render("list_edit", { listing });
};
module.exports.postEditList = async(req, res) => {
    const { id } = req.params;
    const listing = await List.findById(id);

    if (!listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You are not the author");
        return res.redirect(`/listing/${id}`);
    }

    await List.findByIdAndUpdate(id, req.body.listing, {
        runValidators: true,
    });

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
        await listing.save();
    }

    req.flash("success", "Listing updated");
    res.redirect(`/listing/${id}`);
};

module.exports.deleteList = async(req, res) => { //method 
    if (!req.isAuthenticated()) {
        req.flash("error", "you must be logged in ");
        return res.redirect("/signup/login");
    }
    let { id } = req.params;
    await List.findByIdAndDelete(id); //never use form ke andar form
    req.flash("success", "Deleted the Listing");
    res.redirect("/listening");

};
