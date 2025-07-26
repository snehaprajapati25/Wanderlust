const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer'); 
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//index route and create route for listings and search route
router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn, 
    upload.single('listing[image][url]'), 
    validateListing,
    wrapAsync(listingController.createListing)
)

//new route (add new listing)
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show, update, delete routes
router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put( 
    isLoggedIn, 
    isOwner, 
    upload.single('listing[image][url]'), 
    validateListing, 
    wrapAsync(listingController.updateListing)
)
.delete(
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.destroyListing)
);


//edit route
router.get(
    "/:id/edit", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.renderEditForm)
);


module.exports = router;
