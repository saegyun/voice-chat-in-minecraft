const path = require("path");

module.exports = {
	mode: "development",
	entry: {
		main: "./src/public/js/main.js",
	},
	output: {
		filename: "[name].js",
		path: path.resolve("./src/public/dist"),
	},
};