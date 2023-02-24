const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect(
	"",
	(error) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Connected to MongoDB!");
		}
	}
);
