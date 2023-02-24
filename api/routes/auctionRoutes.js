const router = require("express").Router();
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");

// get a specific auction
router.get("/", async (req, res) => {
	try {
		const { auctionId } = req.query;
		const auction = await Auction.findOne({ auctionId: auctionId });

		if (auction.length === 0) {
			return res.status(400).json({
				message: "No auction with ID " + auctionId + " exists!",
			});
		}

		const bids = await Bid.find({ auctionId: auctionId }).sort({
			newBid: -1,
		});

		return res.status(200).json({ auction: auction, bids: bids });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
});

// get all auctions (pagenated)
router.get("/all", async (req, res) => {
	try {
		const auctions = await Auction.find({ finished: false }).sort({
			fee: -1,
			auctionId: 1,
		});
		return res.status(200).json(auctions);
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
});

// this should be protected in the future!
router.post("/new", async (req, res) => {
	const {
		owner,
		auctionId,
		nftAddress,
		tokenId,
		endTimeEpoch,
		minPrice,
		fee,
		finished,
	} = req.body;

	const exists = await Auction.findOne({ auctionId: auctionId });
	if (exists) return;
	
	const newAuction = new Auction({
		owner: owner,
		auctionId: auctionId,
		nftAddress: nftAddress,
		tokenId: tokenId,
		endTimeEpoch: endTimeEpoch,
		minPrice: minPrice,
		fee: fee,
		finished: finished,
	});

	try {
		await newAuction.save();
		console.log("Saved new auction to database!");
		return res.status(200).json({ message: "Saved!" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message });
	}
});

module.exports = router;
