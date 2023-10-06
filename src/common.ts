import express from 'express';
import path from 'path';
import https from "https";
import fs from "fs";
import { Server } from 'socket.io';


const basicPath = path.resolve();

export const Paths = {
	dirname: basicPath + "/src",
	public: basicPath + "/src/public",
	views: basicPath + "/src/views",
	livekit: basicPath + "/node_modules/livekit-client",
	ssl: basicPath + "/ssl"
} 

const app = express();

const options = {
	key: fs.readFileSync(Paths.ssl + '/privKey.pem'),
	cert: fs.readFileSync(Paths.ssl + '/cert.pem')
};
const server = https.createServer(options, app);

const io: Server = new Server(server, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true,
	},
});

export const Servers = {
	express: app,
	https: server,
	socket: io,
}
