// fixGeo.js (place this in your project root)
const mongoose = require("mongoose");
const Listing = require("./models/listing"); // ✅ correct relative path
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config(); // ✅ load .env file

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// Connect to your database
mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

async function fixMissingGeometry() {
    const listings = await Listing.find({
        $or: [
            { "geometry": { $exists: false } },
            { "geometry.coordinates": { $exists: false } },
            { "geometry.coordinates": { $size: 0 } }
        ]
    });

    console.log(`Listings to fix: ${listings.length}`);

    for (let listing of listings) {
        const { location, country } = listing;

        if (!location || !country) {
            console.log(`Skipping ${listing.title}: missing location/country`);
            continue;
        }

        const response = await geocodingClient.forwardGeocode({
            query: `${location}, ${country}`,
            limit: 1
        }).send();

        const geoData = response.body.features[0];

        if (geoData) {
            listing.geometry = geoData.geometry;
            await listing.save();
            console.log(`Fixed: ${listing.title}`);
        } else {
            console.log(`Skipped: ${listing.title} - location not found`);
        }
    }

    console.log("Done updating listings with missing geometry.");
    mongoose.connection.close();
}

fixMissingGeometry();
