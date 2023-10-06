import express from "express";
import { RoomServiceClient, Room, AccessToken } from "livekit-server-sdk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { Servers } from "../common.js";

dotenv.config();

const io: Server = Servers.socket;

export const livekitRouter = express.Router();

const createToken = (roomname: string, participantName: string) => {
	const at = new AccessToken(process.env.API_KEY, process.env.SECRET_KEY, {
		identity: participantName,
	});
	at.addGrant({ roomJoin: true, room: roomname, canPublish: true, canSubscribe: true });

	return at.toJwt();
}

livekitRouter.get('/getToken', (req, res) => {
	try {
		if (!req.query.roomname) {
			res.send(JSON.stringify({
				"status": 500,
				"reason": "roomname is undefined",
 			}));
			return;
		}
		if (!req.query.username) {
			res.send(JSON.stringify({
				"status": 500,
				"reason": "username is undefined",
 			}));
			return;
		}

		res.send(JSON.stringify({
			"status": 200,
			"data": createToken(req.query.roomname as string, req.query.username as string),
		}));
	} catch(e) {
		console.log(e);
		res.send(JSON.stringify({
			"status": 500,
			"reason": e
		}));
	}
});

livekitRouter.get('/getRooms', async (req, res) => {
	try {
		const roomService = new RoomServiceClient(process.env.HOST!, process.env.API_KEY, process.env.SECRET_KEY);
		const rooms: Room[] = await roomService.listRooms();
		
		res.send(JSON.stringify({
			"status": 200,
			"data": rooms,
		}));
	} catch(e) {
		console.log(e);
		res.send(JSON.stringify({
			"status": 500,
			"reason": e
		}));
	}
});

livekitRouter.get('/getMembers', async (req, res) => {
	try {
		if (!req.query.roomname) {
			res.send(JSON.stringify({
				"status": 500,
				"reason": "roomname is undefined",
 			}));
			return;
		}
		const roomService = new RoomServiceClient(process.env.HOST!, process.env.API_KEY, process.env.SECRET_KEY);
		const memebers = await roomService.listParticipants(req.query.roomname as string);
		
		res.send(JSON.stringify({
			"status": 200,
			"data": memebers,
		}));
	} catch(e) {
		console.log(e);
		res.send(JSON.stringify({
			"status": 500,
			"reason": e
		}));
	}
});

livekitRouter.post('/makeRoom', async (req, res) => {
	try {
		if (!req.body.roomname) {
			
			res.send(JSON.stringify({
				"status": 500,
				"reason": "roomname is undefined",
			}));
			return;
		}

		const roomService = new RoomServiceClient(process.env.HOST!, process.env.API_KEY, process.env.SECRET_KEY);
		await roomService.createRoom({
			name: req.body.roomname,
			emptyTimeout: 10 * 60,
			maxParticipants: 20,
		});

		console.log("room created", req.body.roomname, new Date());
		io.sockets.emit("room");
		res.send(JSON.stringify({
			"status": 200,
		}));
	} catch(e) {
		console.log(e);
		res.send(JSON.stringify({
			"status": 500,
			"reason": e,
		}));
	}
});

livekitRouter.post('/deleteRoom', async (req, res) => {
	try {
		if (!req.body.roomname) {
				
			res.send(JSON.stringify({
				"status": 500,
				"reason": "roomname is undefined",
			}));
			return;
		}

		const roomService = new RoomServiceClient(process.env.HOST!, process.env.API_KEY, process.env.SECRET_KEY);
		await roomService.deleteRoom(req.body.roomname);

		console.log("room deleted", req.body.roomname, new Date());

		res.send(JSON.stringify({
			"status": 200,
		}));
	} catch(e) {
		console.log(e);
		res.send(JSON.stringify({
			"status": 500,
			"reason": e,
		}));
	}
});
