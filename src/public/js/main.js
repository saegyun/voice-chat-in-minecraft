import * as livekit from "./livekit.js"; 
import { RoomEvent, Track, createLocalAudioTrack } from 'livekit-client';
import * as mc from "./minecraft.js";

const info = {
	name: "undefined",
	roomName: "undefined",
	muted: false,
	room: undefined,
	socket: undefined,
	min: 10,
	max: 50,
};

function calcVol(d) {
	if (d < info.min) { 
		return 1;
	} else if (d < info.max) {
		return 1 - Math.floor((100 - 2.25 * (40 / info.max - info.min) * (d -info.min)) / 100) / 10;
	} else {
		return 0;
	}
}

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

$(document).ready(async () => {
	await getAudios();
	info.socket = mc.connectWebSocket();
	
	$("#min-range")[0].readOnly = true;
	$("#max-range")[0].readOnly = true;
	
	$("#min-range").val(info.min);
	$("#max-range").val(info.max);

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
	// const volumeInput = $("#input-volume");
	const muteBtn = $("#mute");
	const quit = $("#quit");

	nameInput.focus();

	const updateMemberList = (room) => {
		// livekit participant 리스트 가져와서 append
		const memberList = room.participants;
		
		members.html("");

		memberList.forEach(v => {
			members.append($(`<ul>${v.identity}</ul>`));
		});
	};

	const updateRoomList = async () => {
		const rooms = await livekit.getRooms();
		
		roomList.html("");

		rooms.forEach(v => {
			const newRoom = $(`<ul>${v.name}</ul>`);
			roomList.append(newRoom);
			newRoom.on("click", roomEnter);
		});
	};

	const roomEnter = async function() { 
		const roomName = $(this).text();

		if (info.room !== undefined) {
			return;
		}

		// livekit 방 참가
		const room = await livekit.joinRoom(info.name, roomName);

		info.room = room;

		room.on(RoomEvent.ParticipantConnected, async (remoteParticipant) => {
			updateMemberList(room);
		});
	
		room.on(RoomEvent.ParticipantDisconnected, async (remoteParticipant) => {
			updateMemberList(room);
			document.getElementById(`${remoteParticipant.identity}`).remove();
			if (mc.deletePosition(remoteParticipant.identity)) {
				console.log("delete postition for", data.name);
			}
		});
	
		room.on(RoomEvent.TrackSubscribed, async (track, publication, participant) => {
			const element = track.attach();
			console.log("subscribe track", participant.identity, " -> ", track.trackSid);
			
			const previousElement = document.getElementById(participant.identity);
			if (previousElement) {
				previousElement.remove();
			}

			element.hidden = true;
			element.id = participant.identity;
			element.className = "audioEmitter";
			await element.play();
			document.body.appendChild(element);
		});
	
		room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
			speakers.forEach(v => {
				console.log(`${v.identity} is speaking\n`);
			});
			console.log('\n');
		});

		// room.on(RoomEvent.TrackPublished, (publication, remoteParticipant) => {

		// });

		room.participants.forEach(async participant => {
			const track = participant.getTrack(Track.Source.Microphone);
			
			if (track) {
				track.setSubscribed(true);
				
				console.log("track for new participant", participant.identity, " -> ", track.trackSid);
				const element = track.track.attach();
				console.log("subscribe track", participant.identity, " -> ", track.trackSid);
				
				element.hidden = true;
				element.id = participant.identity;
				element.className = "audioEmitter";

				await element.play();
				document.body.appendChild(element);
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

		info.name = nameInput.val();
		// info.name = nameInput.val() + "#" + Math.random().toString(36).slice(6);
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

	// volumeInput.on("input", () => {
	// 	$("#volume").text(volumeInput.val() + "%");

	// 	// 오디오 트랙 입력 gain줄이기
	// 	info.room.localParticipant.audioLevel = Math.floor(volumeInput.val() / 10) / 10;
	// });

	muteBtn.on("click", () => {
		if (info.muted) {
			$("#mic-off").hide(() => {
				$("#mic-on").show();
			});
			// 오디오 트랙 unmute
			info.room.localParticipant.getTrack(Track.Source.Microphone)?.unmute();
	
		} else {
			$("#mic-on").hide(() => {
				$("#mic-off").show();
			});
			// 오디오 트랙 mute
			info.room.localParticipant.getTrack(Track.Source.Microphone)?.mute();
		}
		info.muted = !info.muted;
	});
	quit.on("click", () => {

		info.room.disconnect();

		Array.from(document.getElementsByClassName("audioEmitter")).forEach(v => { v.remove(); });

		mainPage.fadeOut(100, async () => {
			members.html("");
			
			// livekit 방 리스트 가져와서 append
			await updateRoomList();

			roomSelectPage.fadeIn(100);
		});

		info.room = undefined;
		info.roomName = "undefined";

		$("#mic-off").hide(() => {
			$("#mic-on").show();
		});
		info.muted = false;
		
		$("#minecraft").text("Off");
		if (info.socket) {
			info.socket.off("position");
			$("#min-range")[0].readOnly = true;
			$("#max-range")[0].readOnly = true;
		}
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

	$("#mics").on("change", async () => {
		const target = livekit.getMicDevice();
		if (info.room) {
			const previousAudioTrack = info.room.localParticipant.getTrack(Track.Source.Microphone).track;

			if (previousAudioTrack) {
				info.room.localParticipant.unpublishTrack(previousAudioTrack, true);
			} else {
				console.error('이전 오디오 트랙을 찾을 수 없습니다.');
				return;
			}

			const audioTrack = await createLocalAudioTrack({
				echoCancellation: true,
				noiseSuppression: true,
				deviceId: target,
			});
			info.room.localParticipant.publishTrack(audioTrack);

			if (!info.muted) {
				info.room.localParticipant.getTrack(Track.Source.Microphone)?.unmute();
			} else {
				info.room.localParticipant.getTrack(Track.Source.Microphone)?.mute();
			}
		}
	});

	$("#minecraft").on("click", function() {
		if ($(this).text().trim() === "Off") {
			$(this).text("On");
			$("#min-range")[0].readOnly = false;
			$("#max-range")[0].readOnly = false;

			info.socket.on("position", (data) => {
				if (info.room) {
					if (data.name === info.room.localParticipant.identity) {
						mc.setPosition(data.name, data.position);
						console.log("update postition for", data.name, "\n");
						return;
					}

					info.room.participants.forEach(v => {
						if (v.identity === data.name) {
							mc.setPosition(data.name, data.position);
				
							const userPosition = mc.getPosition(info.room.localParticipant.identity);
							const targetPosition = mc.getPosition(data.name);
							const targetAudio = document.getElementById(data.name);

							if (!userPosition || !targetPosition || !targetAudio) {
								return;
							}

							let dist = Math.pow(userPosition.x - targetPosition.x, 2)
							+ Math.pow(userPosition.y - targetPosition.y, 2)
							+ Math.pow(userPosition.z - targetPosition.z, 2);

							dist = Math.floor(Math.sqrt(dist) * 10) / 10;
							targetAudio.volume = calcVol(dist);

							console.log("update postition for", data.name, "\n");
							console.log("update volume for", data.name, "to", targetAudio.volume,"\n");
							return;
						}
					});
					
				}
			});
		
		} else {
			$(this).text("Off");
			info.socket.off("position");

			$("#min-range")[0].readOnly = true;
			$("#max-range")[0].readOnly = true;
		}
	});
	$("#min-range").on("change", function() {
		if (Number.parseInt($(this).val()) + 5 > Number.parseInt($("#max-range").val())) {
			$(this).val($("#max-range").val() - 5);
		}
		
		if (Number.parseInt($(this).val()) < 5) {
			$(this).val(5);
		}

		info.min = Number.parseInt($(this).val());
	});

	
	$("#max-range").on("change", function() {
		if (Number.parseInt($(this).val()) - 5 < Number.parseInt($("#min-range").val())) {
			$(this).val($("#min-range").val() + 5);
		}
		if (Number.parseInt($(this).val()) < 10) {
			$(this).val(10);
		}

		info.max = Number.parseInt($(this).val());
	});

	info.socket.on("room", () => {
		updateRoomList();
	});
});