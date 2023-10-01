const info = {
	name: "undefined",
	roomName: "undefined",
	muted: false,

};

async function getAudios() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const mics = devices.filter(device => device.kind === "audioinput");
		const speakers = devices.filter(device => device.kind === "audiooutput");

		mics.forEach(audio => {
			const option = document.createElement("option");
			option.value = audio.deviceId;
			option.innerText = audio.label;
			
			document.getElementById("mics").appendChild(option);
		});
		
		speakers.forEach(audio => {
			const option = document.createElement("option");
			option.value = audio.deviceId;
			option.innerText = audio.label;
			
			document.getElementById("speakers").appendChild(option);
		});
		document.getElementById("speakers").children[0].selected = true;
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

	const updateRoomList = () => {

	};

	const roomEnter = function() { 
		const roomName = $(this).text();
		alert(roomName);

		// livekit 방 참가

		roomSelectPage.fadeOut(100, () => {
			// livekit participant 리스트 가져와서 append

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
		nameInsertPage.fadeOut(100, () => {
			// livekit 방 리스트 가져와서 append
			updateRoomList();
			
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
	
	$("#create").on("click", () => {
		if (!roomNameInput.val()) {
			alert("방 이름은 필수입니다.");
			return;
		}

		// livekit 방 생성

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
		mainPage.fadeOut(100, () => {
			members.html("");
			
			// livekit 방 리스트 가져와서 append
			updateRoomList();			

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