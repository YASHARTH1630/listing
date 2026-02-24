const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapsync = require("../wrapsync.js");
const passport = require("passport");

router.get("/", (req, res) => {
    res.render("signup");
});
router.post("/post", wrapsync(async(req, res) => {
    const redirectUrl = req.session.redirectUrl || "/listening";
    let { username, email, password } = req.body;
    const newUser = User({ username, email });
    const regUser = await User.register(newUser, password);
    console.log(regUser);
    req.login(regUser, (err) => { 
        if (err) {
            return next(err);
        }
        req.flash("success", "Welcome to Wanderlust");
        res.redirect(redirectUrl);
    });
}));
router.get("/login", (req, res) => {
    res.render("login");
});
router.post("/login/post", passport.authenticate("local", { failureRedirect: '/signup/login', failureFlash: true }), wrapsync(async(req, res) => {
    req.flash("success", "Welcome Back");
    res.redirect("/listening");
}));
//LOGOUT 
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "YOU ARE LOGGED OUT SUCCESSFULLY");
        res.redirect("/listening");
    })
});

module.exports = router;
