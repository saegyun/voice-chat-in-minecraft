import express from "express";
import { Paths } from "./common.js";
import { livekitRouter } from "./routers/livekit.js";
import { initMinecraftWebSocket } from "./minecraft.js";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import { Server, Socket } from "socket.io";

dotenv.config();

const app = express();
const options = {
	key: fs.readFileSync(Paths.ssl + '/privKey.pem'),
	cert: fs.readFileSync(Paths.ssl + '/cert.pem')
};

const port = 4430;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => { 
	console.log(`Request occur! ${req.method}, ${req.url} - ${new Date()}\n`); 
	next(); 
});

app.use("/public", express.static(Paths.public));
app.use("/livekit", livekitRouter);

app.get("/", (req, res) => {
	res.sendFile(Paths.views + "/index.html");
});

const server = https.createServer(options, app);

const io = new Server(server, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true,
	},
});

initMinecraftWebSocket(3000, (player) => {
	// console.log(player.name, player.position);
	
	io.sockets.emit("position", {
		name: player.name,
		position: player.position
	});
});

io.on("connection", (socket: Socket) => {
	console.log(`user(${socket.id}) connected - ${new Date()}`);

	socket.on("disconnect", () => {
		console.log(`user(${socket.id}) disconnected - ${new Date()}`);
	});
});

server.listen(port, () => {
	console.log("HTTPS server listening on port " + port);
});
