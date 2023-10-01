import express from "express";
import { Paths } from "./common.js";
import { livekitRouter } from "./routers/livekit.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => { 
	console.log(`Request occur! ${req.method}, ${req.url}\n`); 
	next(); 
});

app.use("/public", express.static(Paths.public));
app.use("/livekit", livekitRouter);

app.get("/", (req, res) => {
	res.sendFile(Paths.views + "/index.html");
});

app.listen(port, () => {
	console.log("server opened");
	
});