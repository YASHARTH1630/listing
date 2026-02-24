  module.exports.isOwner = async(req, res, next) => { //middleware for permission to edit and delete
      let { id } = req.params;
      let CS = req.user

      // debug
      let listing = await List.findByIdAndUpdate(id, req.body.listing, { runValidators: true });
      if (listing.owner._id.equals(CS._id)) { //only author can change this ,not for hoppscoth too
          req.flash("error", "YOUR ARE NOT AUTHOR OF THIS LIST");
          return res.redirect("/list/${id}"); //return otherwise niceh wale code run krjayega
      }
      next(); //if not next ,means to do other thing as coded
  };
