const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const query = req.query.q;

    let allListings = query
        ? await Listing.find({
            $or: [
                { location: { $regex: query, $options: "i" } },
                { country: { $regex: query, $options: "i" } },
                { title: { $regex: query, $options: "i" } }
            ]
          })
        : await Listing.find({});

    res.render("listings/index", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"  // populate author of each review
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("success", "The listing you requested does not exist!");
        res.redirect("/listings");
    }

     const mapToken = process.env.MAP_TOKEN; // ✅ pass it to the view

    res.render("listings/show", { listing, mapToken });
}

module.exports.createListing = async (req, res) => {
    const { location, country } = req.body.listing;

    let response = await geocodingClient.forwardGeocode({
        query: `${location}, ${country}`, 
        limit: 1
    })
    .send()

    const newListing = new Listing(req.body.listing);

    //image & owner
    newListing.image = { 
        url :req.file.path , 
        filename: req.file.filename
    };
    newListing.owner = req.user._id;

    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    
    req.flash("success", "New Lisitng Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("success", "The listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    if (originalImageUrl.includes("res.cloudinary.com")) {
        // cloudinary resize
        originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250,h_150,c_fill/");
    } else if (originalImageUrl.includes("images.unsplash.com")) {
        // unsplash resize
        originalImageUrl = originalImageUrl.replace(/w=\d+/, "w=250").replace(/h=\d+/, "h=150");
        if (!originalImageUrl.includes("h=")) {
            originalImageUrl += "&h=150";
        }
    }

    res.render("listings/edit", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Step 2: Update listing fields (non-image)
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

     // Re-geocode if location or country changed
     const { location, country } = req.body.listing;
    if (location && country) {
        const response = await geocodingClient.forwardGeocode({
            query: `${location}, ${country}`,
            limit: 1
        }).send();

        const geoData = response.body.features[0];
        if (geoData) {
            listing.geometry = geoData.geometry;
        } else {
            req.flash("error", "Invalid location. Could not update map.");
            return res.redirect(`/listings/${id}/edit`);
        }
    }

    // Step 3: Handle image update
    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        listing.image = { url, filename };
    }

    // Step 4: Save updated listing
    await listing.save();

    req.flash("success", "Lisitng Updated!");
    res.redirect(`/listings/${id}`); // redirect to the show page of the listing after updating   
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Lisitng Deleted!");
    res.redirect("/listings");
}

// module.exports.searchListings = async (req, res) => {
//     const query = req.query.q;
//     let allListings = query
//         ? await Listing.find({
//             $or: [
//                 { location: { $regex: query, $options: "i" } },
//                 { country: { $regex: query, $options: "i" } },
//                 { title: { $regex: query, $options: "i" } }
//             ]
//           })
//         : await Listing.find({});

//     res.render("listings/index", { allListings });
// };

