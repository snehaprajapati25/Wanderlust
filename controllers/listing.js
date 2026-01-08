const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// GET /listings
module.exports.index = async (req, res) => {
  const { q, category } = req.query;
  let filter = {};

  // Text search
  if (q) {
    filter.$or = [
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { title: { $regex: q, $options: "i" } },
    ];
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);
  return res.render("listings/index", {
    allListings,
    selectedCategory: category,
  });
};

// GET /listings/new
module.exports.renderNewForm = (req, res) => {
  return res.render("listings/new");
};

// GET /listings/:id
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings"); // stop here
  }

  const mapToken = process.env.MAP_TOKEN;
  return res.render("listings/show", { listing, mapToken });
};

// POST /listings
module.exports.createListing = async (req, res) => {
  const { location, country } = req.body.listing;

  const response = await geocodingClient
    .forwardGeocode({
      query: `${location}, ${country}`,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);

  // image & owner
  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();
  req.flash("success", "New Lisitng Created!");
  return res.redirect("/listings");
};

// GET /listings/:id/edit
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;

  if (originalImageUrl.includes("res.cloudinary.com")) {
    // cloudinary resize
    originalImageUrl = originalImageUrl.replace(
      "/upload/",
      "/upload/w_250,h_150,c_fill/"
    );
  } else if (originalImageUrl.includes("images.unsplash.com")) {
    // unsplash resize
    originalImageUrl = originalImageUrl
      .replace(/w=\d+/, "w=250")
      .replace(/h=\d+/, "h=150");

    if (!originalImageUrl.includes("h=")) {
      originalImageUrl += "&h=150";
    }
  }

  return res.render("listings/edit", { listing, originalImageUrl });
};

// PUT /listings/:id
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
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
  listing.category = req.body.listing.category;

  // Re-geocode if location or country changed
  const { location, country } = req.body.listing;
  if (location && country) {
    const response = await geocodingClient
      .forwardGeocode({
        query: `${location}, ${country}`,
        limit: 1,
      })
      .send();

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
  return res.redirect(`/listings/${id}`); // redirect to the show page
};

// DELETE /listings/:id
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Lisitng Deleted!");
  return res.redirect("/listings");
};
