import * as livekit from "./livekit.js"; 
import { RoomEvent, Track } from 'livekit-client';

const info = {
	name: "undefined",
	roomName: "undefined",
	muted: false,
};

async function getAudios() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const mics = devices.filter(device => device.kind === "audioinput");
		// const speakers = devices.filter(device => device.kind === "audiooutput");

		mics.forEach(audio => {
			const option = document.createElement("option");
			option.value = audio.deviceId;
			option.innerText = audio.label;
			
			document.getElementById("mics").appendChild(option);
		});
		
		// speakers.forEach(audio => {
		// 	const option = document.createElement("option");
		// 	option.value = audio.deviceId;
		// 	option.innerText = audio.label;
			
		// 	document.getElementById("speakers").appendChild(option);
		// });
		// document.getElementById("speakers").children[0].selected = true;
		document.getElementById("mics").children[0].selected = true;
	} catch(e) {
		console.log(e);
	}
}

$(document).ready(() => {
	getAudios();

	const name = $("#name");

	// page 1
	const nameInsertPage = $("#insert-name");
	const nameInput = $("#username");	
	const nameInputBtn = $("#pass");

	// page 2
	const roomSelectPage = $("#room-select");
	const roomList = $("#rooms");
	const roomCreateBtn = $("#room-create");
	const roomNameInput = $("#roomname");

	// page 3
	const mainPage = $("#main");
	const status = $("#status");
	const members = $("#members");
	const volumeInput = $("#input-volume");
	const muteBtn = $("#mute");
	const quit = $("#quit");

	nameInput.focus();

	const updateMemberList = (room) => {
		// livekit participant 리스트 가져와서 append
		const memberList = room.participants;
			
		memberList.forEach(v => {
			members.append($(`<ul>${v.identity}</ul>`));
		});
	};

	const updateRoomList = async () => {
		const rooms = await livekit.getRooms();
		rooms.forEach(v => {
			const newRoom = $(`<ul>${v.name}</ul>`);
			roomList.append(newRoom);
			newRoom.on("click", roomEnter);
		});
	};

	const roomEnter = async function() { 
		const roomName = $(this).text();

		// livekit 방 참가
		const room = await livekit.joinRoom(info.name, roomName);

		room.on(RoomEvent.ParticipantConnected, async (remoteParticipant) => {
			updateMemberList(room);
		});
	
		room.on(RoomEvent.ParticipantDisconnected, async () => {
			updateMemberList(room);
		});
	
		room.on(RoomEvent.TrackSubscribed, async (track, publication, participant) => {
			const element = track.attach();
			console.log("subscribe track", participant.identity, " -> ", track.trackSid);
			
			element.hidden = true;
			element.id = participant.name;
			await element.play();
			document.body.appendChild(element);
		});
	
		room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
			let data = "current speakers : ";
			speakers.forEach(v => {
				data += v.identity + " ";
			});
			console.log(data);
		});

		room.participants.forEach(participant => {
			const track = participant.getTrack(Track.Source.Microphone);
			
			if (track) {
				track.setSubscribed(true);
				console.log("track for new participant", participant.identity, " -> ", track.trackSid);
			}
		});

		roomSelectPage.fadeOut(100, async () => {
			updateMemberList(room);
			status.text(roomName);
			mainPage.fadeIn(100);
		});
	};

	const roomCreatePopupHide = () => {
		$("#popup-layer").hide();
		$("#room-create-name").hide();	
	}

	nameInputBtn.on("click", () => {
		if (!nameInput.val()) {
			alert("이름은 필수입니다.");
			return;
		}

		info.name = nameInput.val() + "#" + Math.random().toString(36).slice(6);
		$("#name").text(info.name);
		nameInsertPage.fadeOut(100, async () => {
			// livekit 방 리스트 가져와서 append
			await updateRoomList();
			
			roomSelectPage.fadeIn(100);
		});
	});

	roomCreateBtn.on("click", () => {
		$("#popup-layer").show();
		$("#room-create-name").show();
		roomNameInput.val("");
	});
	roomList.children().on("click", roomEnter);
	
	$("#halt").on("click", roomCreatePopupHide);

	roomNameInput.keyup(() => {
		roomNameInput.val(roomNameInput.val().replace(" ", "_"));
	});
	
	$("#create").on("click", async () => {
		if (!roomNameInput.val()) {
			alert("방 이름은 필수입니다.");
			return;
		}

		// livekit 방 생성
		await livekit.makeRoom(roomNameInput.val());

		const newRoom = $(`<ul>${roomNameInput.val()}</ul>`);
		newRoom.on("click", roomEnter);
		roomList.append(newRoom);
		roomCreatePopupHide();
	});

	volumeInput.on("input", () => {
		$("#volume").text(volumeInput.val() + "%");

		// 오디오 트랙 입력 gain줄이기

	});

	muteBtn.on("click", () => {
		if (info.muted) {
			$("#mic-off").hide(() => {
				$("#mic-on").show();
			});
			// 오디오 트랙 unmute
	
		} else {
			$("#mic-on").hide(() => {
				$("#mic-off").show();
			});
			// 오디오 트랙 mute

		}
		info.muted = !info.muted;
	});
	quit.on("click", () => {
		mainPage.fadeOut(100, async () => {
			members.html("");
			
			// livekit 방 리스트 가져와서 append
			await updateRoomList();			

			roomSelectPage.fadeIn(100);
		});
	});
	$("#option-btn, #save").on("click", () => {
		if ($("#popup-layer").css("display") === "none") {
			$("#popup-layer").show();
			$("#option").show();	
		} else {
			$("#popup-layer").hide();
			$("#option").hide();
		}
	});
});