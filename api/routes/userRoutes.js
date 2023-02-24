const router = require("express").Router();
const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
	apiKey: "",
	network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

router.get("/nft", async (req, res) => {
	const { wallet } = req.query;

	console.log(wallet)

	try {
		const nftData = await alchemy.nft.getNftsForOwner(wallet);
		return res.status(200).json(nftData);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message });
	}
});

module.exports = router;
