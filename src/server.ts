import express from "express";
import { Paths } from "./common.js";
import { livekitRouter } from "./routers/livekit.js";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";

dotenv.config();

const app = express();
const options = {
	key: fs.readFileSync(Paths.ssl + '/privKey.pem'),
	cert: fs.readFileSync(Paths.ssl + '/cert.pem')
};

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

const server = https.createServer(options, app);

server.listen(port, () => {
	console.log("HTTPS server listening on port " + port);
});
