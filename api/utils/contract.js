const ethers = require("ethers");
const { contractAddress, contractAbi } = require("./constants");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");

const provider = new ethers.providers.JsonRpcProvider(
	"https://rpc.ankr.com/eth_goerli"
);
const signer = provider.getSigner();
const houseContract = new ethers.Contract(contractAddress, contractAbi, signer);

console.log("Listening for new auction events...");
houseContract.on(
	"NewAuction",
	async (
		owner,
		auctionId,
		nftAddress,
		tokenId,
		endTime,
		minPrice,
		fee,
		finished,
		event
	) => {

		const exists = await Auction.findOne({ auctionId: auctionId });
		if (exists) return;
		
		const newAuction = new Auction({
			owner: owner.toString(),
			auctionId: auctionId.toNumber(),
			nftAddress: nftAddress.toString(),
			tokenId: tokenId.toNumber(),
			endTimeEpoch: endTime.toNumber(),
			minPrice: minPrice.toString(),
			fee: fee.toString(),
			finished: finished,
		});
		try {
			await newAuction.save();
			console.log("Saved new auction to database!");
		} catch (error) {
			console.error(error);
		}
	}
);

console.log("Listening for fee update events...");
houseContract.on("UpdateFee", async (auctionId, newFee, event) => {
	try {
		await Auction.updateOne(
			{ auctionId: auctionId.toNumber() },
			{ fee: newFee.toString() }
		);
		console.log("Successfully updated fee for auction #" + auctionId + "!");
	} catch (error) {
		console.error(error);
	}
});

console.log("Listening for new bid events...");
houseContract.on("NewBid", async (auctionId, bidder, newBid) => {
	try {
		const bid = new Bid({
			auctionId: auctionId.toNumber(),
			bidder: bidder.toString(),
			newBid: newBid.toString(),
		});
		await bid.save();
		console.log("Recorded bid for auction #" + auctionId + "!");
	} catch (error) {
		console.error(error);
	}
});
