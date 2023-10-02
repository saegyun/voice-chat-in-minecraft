import ws from "ws";
import * as uuid from "uuid";

export function initMinecraftWebSocket(port: number, callBack: (...arg: any) => any) {
	const wss = new ws.Server({
		port: port
	}, () => {
		console.log("Minecraft WebSocket Server Established at " + port);
	});
	
	wss.on("connection", (socket, req) => {
		console.log(`new minecraft connection esablished!\n`);

		socket.send(JSON.stringify({
			header: {
				version: 1,
				requestId: uuid.v4(),
				messageType: "commandRequest",
				messagePurpose: "subscribe",
			},
			body: {
				eventName: "PlayerTravelled",
			},
		}));
	
		socket.on('message', packet => {
			const msg = JSON.parse(packet.toString());

			if(msg.header.eventName != "PlayerTravelled") {
				return;
			}
			const player = msg.body.player;
			
			callBack(player);
		});
	});
}
