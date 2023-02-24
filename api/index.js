require("./utils/db");
require("./utils/contract");
const express = require("express");
const cors = require("cors");

const auctionRoutes = require("./routes/auctionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
	res.send("Keynes API 1.0");
});
app.use("/auction", auctionRoutes);
app.use("/user", userRoutes);

app.listen(4000, () => {
	console.log("Express app listening on port " + 4000 + "!");
});
