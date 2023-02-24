const mongoose = require("mongoose");
const { Schema } = mongoose;

const auctionSchema = new Schema({
	owner: String,
	auctionId: Number,
	nftAddress: String,
	tokenId: Number,
	endTimeEpoch: Number,
	minPrice: String,
	fee: String,
	finished: Boolean,
});

const Auction = mongoose.model("Auction", auctionSchema);

module.exports = Auction;
