//downloaded ejs,express,mongoose,joi ,connect-flash,cookie-parser,passport,passport-local,dotenv ,multer in node mongoose
if (process.env.NODE_ENV != 'production') {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const List = require("./models/listing.js");
const Review = require("./models/review.js"); //uppercase
const listingController = require("./controller/listing.js");
const reviewController = require("./controller/review.js");
let port = 8010;
const methodOverride = require("method-override");
const wrapsync = require("./wrapsync.js");
const cookieParser = require("cookie-parser"); //requirement for parsing cookie
/*const MongoStore = require("connect-mongo");*/
const session = require("express-session"); //require for creating sesion ,when visit website
const flash = require("connect-flash");
const ExpressError = require("./expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); //requiring individually
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const signup = require("./router/user.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js"); //extra line in comparison with local storage
const upload = multer({ storage });

/*
const storage = multer.diskStorage({ //laptp main store
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage }); //laptop main store */
/*app.use("/uploads", express.static("uploads")); //uploads main storage krne k liye it will create automatically*/

app.use(express.urlencoded({ extended: true })); //post ke liye hain
app.use(methodOverride("_method")); //patch ,put ,delete 
/*
const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    crypto: {
        secret: "mysecretstring"
    },
    touchAfter: 24 * 3600
});*/

app.use(session({

    secret: "mysecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 7 * 60 * 60 * 24,
        maxAge: 7 * 60 * 60 * 24,
        httpOnly: true
    }
}));
/*
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        touchAfter: 24 * 3600
    }),
    secret: "mysecretstring",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 7 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
*/
app.set("views", path.join(__dirname, "views")); //views folder pane ke liye 
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
//for styling to be included here  will created public folder in mongo3 , creating style.css there

main().then((res) => { //always call main function
    console.log("connection ");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    /* console.log("Mongo URI:", process.env.MONGO_URL);
     await mongoose.connect(process.env.MONGO_URL, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
     });*/
    console.log("MongoDB connected");
};
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; //curent user ka deatil will store and dosri jagah use kr paye beyond this fiel local sue kiya h
    next(); //imp
});
app.use("/signup", signup); //niche hona chahiye sb library ke
/*app.get("/duser", async(req, res) => {
    try {
        let fakeUser = new User({
            email: "student@gmail.com"
        });

        let registeredUser = await User.register(fakeUser, "hello123");
        console.log(registeredUser);

        res.send("User created");
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});*/
app.get("/", (req, res) => {
    res.send("working");
});

app.listen(8010, () => {
    console.log("listening to the port 8010");
});
const injectImageForJoi = (req, res, next) => { //
    if (req.file) {
        req.body.listing.image = { //// 2️⃣ fake data , just becuase joi will nt allow to enter ,beecause urlZ& file is empty , req.file hoga ab req.body nhi for image,no more object
            url: "http://temp",
            filename: "temp"
        };
    }
    next();
};
const injectExistingImageForPatch = async(req, res, next) => {
    if (!req.file) {
        const listing = await List.findById(req.params.id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        req.body.listing.image = listing.image;
    } else {
        // new image uploaded
        req.body.listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    next();
};

const validateListing = (req, res, next) => {
    console.log("REQ.BODY 👉", req.body);
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(404, error.message);
    } else {
        next();
    }
};
const validateReview = (req, res, next) => { //validation using joi
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(404, error.message); //throw a error if not validate
    } else {
        next();
    }
};
app.get("/listening", wrapsync(listingController.index));

app.get("/listing/:id", wrapsync(listingController.eachList));
//1 listing ke andar jo review IDs hain
//2 un IDs se Review collection me jaata hai
//3 har ID ka poora review document utha leta hai

/*let item = await List.findById(id);          // ❌ non-populated
const listing = await List.findById(id).populate("reviews"); // populated

res.render("view_item", { item }); // ❌ galat data bhej diya

*/ //-wrong h yeh toatlly wrong paste kiya sikhne k liye
/*✅ FINAL CONFIRMATION
✔ haan, pehle item search hua
✔ phir uske andar ke review IDs uthaye
✔ phir reviews populate hue
✔ ab tum render kar pa rahe ho*/
app.get("/new_list", listingController.renderNewForm);
app.post("/post", upload.single("image"), (req, res, next) => {
    console.log("FILE 👉", req.file);
    console.log("BODY 👉", req.body);
    next();
}, injectImageForJoi, validateListing, wrapsync(listingController.postingList));
app.get("/list/:id/edit", wrapsync(listingController.editEachList));
app.patch("/listing/:id", (req, res, next) => {
    console.log("🔥 PATCH HIT", req.method, req.originalUrl);
    next();
}, upload.single("image"), injectExistingImageForPatch, validateListing, wrapsync(listingController.postEditList));

app.delete("/listing/:id/delete", wrapsync(listingController.deleteList));
//review
app.post("/listing/:id/reviews", reviewController.reviewPost);
//delete_review
app.delete("/listing/:id/review/:reviewid", wrapsync(reviewController.reviewDelete));
app.use((req, res, next) => { //if false link put krdiya 
    next(new ExpressError(404, "Page not found"));
});
app.use((err, req, res, next) => { //koi internal cmd error se issue
    let { status = 500, message = "error" } = err; //default value
    console.log("ERROR DEBUG 👉", err.status, err.message);
    res.status(status).send(err.message);
});
//POST BODY 👉 {hona chahiye
/*listing: {
    title: 'vhj',
    description: 'jhjh',
    location: 'hjvjh',
    country: 'njhvjh',
    image: {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      filename: 'listingimage'
    },
    price: '10001'
  }
}
ERROR DEBUG 👉 404 "listing" is required
REQ.BODY 👉 {was getting
  title: 'jgjh',
  description: 'bhjb',
  location: 'hkjn',
  country: 'bkj',
  image: {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    filename: 'listingimage'
  },
  price: '10001'
}*/