const Listing = require("../models/listing");

const DEFAULT_IMAGE = {
    url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb",
    filename: "default_listing"
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        // Use uploaded file if available, otherwise use default image
        let imageData = DEFAULT_IMAGE;
        if (req.file) {
            imageData = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = imageData;
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        console.error("CREATE LISTING ERROR:", err);
        req.flash("error", "Failed to create listing: " + err.message);
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("UPDATE LISTING ERROR:", err);
        req.flash("error", "Failed to update listing: " + err.message);
        res.redirect("/listings");
    }
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
