import * as io from "socket.io-client";

const map = new Map();

export function getPosition(name) {
	const position = map.get(name);
	return position;
}

export function deletePosition(name) {
	const position = map.get(name);
	if (position) {
		map.delete(name);
		return true;
	}
	return false;
}

export function connectWebSocket() {
	const socket = io.connect();

	socket.on("position", (data) => {
		map.set(data.name, data.position);
	});

	return socket;
}