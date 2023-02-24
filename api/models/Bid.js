const mongoose = require("mongoose");
const { Schema } = mongoose;

const bidSchema = new Schema({
	auctionId: Number,
	bidder: String,
	newBid: String,
});

const Bid = mongoose.model("Bid", bidSchema);

module.exports = Bid;
