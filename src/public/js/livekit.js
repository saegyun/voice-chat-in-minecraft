import { Room } from 'livekit-client';

export async function joinRoom(username, roomname) {

	const wsURL = "wss://discordclone-sivakcmf.livekit.cloud";
	const res = await (await fetch(`livekit/getToken?roomname=${roomname}&username=${username}`)).json();
	
	if (res.status === 500) {
		console.log(res.reason || "undefined error occured");
		return null;
	}

	const room = new Room({
			audioCaptureDefaults: {
			autoGainControl: true,
			deviceId: getMicDevice(),
			echoCancellation: true,
			noiseSuppression: true,
		}
	});
	await room.connect(wsURL, res.data);
	room.localParticipant.setMicrophoneEnabled(true);
	await room.startAudio();

	alert('connected to room', room.name);

	return room;
}

export async function getRooms() {
	const res = await (await fetch(`livekit/getRooms`)).json();
	
	if (res.status === 500) {
		console.log(res.reason || "undefined error occured");
		return null;
	}

	return res.data;
}

export async function getMembers(roomname) {
	const res = await (await fetch(`livekit/getMembers?roomname=${roomname}`)).json();
	
	if (res.status === 500) {
		console.log(res.reason || "undefined error occured");
		return null;
	}

	return res.data;
}

export async function makeRoom(roomname) {

	const res = await $.ajax({
		type: 'post',
		url: 'livekit/makeRoom',
		async: true,
		headers: {
			"Content-type": "application/json",
			"X-HTTP-Method-Override": "POST"
		},
		datatype: 'json',
		data: JSON.stringify({
			"roomname": roomname
		}),
	});
	
	if (res.status === 500) {
		console.log(res.reason || "undefined error occured");
		return false;
	}

	return true;
}

export function getMicDevice() {
	const mic = Array($("#mics")[0].children[0]).find(v => v.selected === true);
	return mic.value;
}

// function getSpeakerDevice() {
// 	const speaker = Array($("#speakers")[0].children[0]).find(v => v.selected === true);
// 	return speaker.value;
// }