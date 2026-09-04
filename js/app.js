const TOKEN_SERVER_ID = "emanlive-2j2epi";
let currentRoomName = null;
let room = null;
let localVideoTrack = null;
let localAudioTrack = null;
let cameraStream = null;

function openLive() {
  const modal = document.getElementById("liveModal");
  if (modal) modal.classList.add("open");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("open");
}

function openParty() {
  const modal = document.getElementById("partyModal");
  if (modal) modal.classList.add("open");
}

function openGifts() {
  const modal = document.getElementById("giftModal");
  if (modal) modal.classList.add("open");
}

function gift(name, cost) {
  alert(name + " selected — " + cost + " coins");
}

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = cameraStream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
    }

    console.log("Camera and microphone ready.");
  } catch (error) {
    console.error(error);
    alert("Camera could not start: " + error.message);
  }
}

async function goLive() {
  try {
    if (!window.LivekitClient) {
      alert("LiveKit is not loaded.");
      return;
    }

    // Stop the preview camera first.
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }

    const tokenSource =
      LivekitClient.TokenSource.developmentTokenServer(
        TOKEN_SERVER_ID
      );

    const roomName = "eman-live-main";
currentRoomName = roomName;
    const credentials = await tokenSource.fetch({
      roomName: roomName,
      participantName: "Eman Host"
    });

    room = new LivekitClient.Room();

    await room.connect(
      credentials.serverUrl,
      credentials.participantToken
    );
room.on(
  LivekitClient.RoomEvent.DataReceived,
  (payload, participant) => {
    try {
      const data = JSON.parse(
        new TextDecoder().decode(payload)
      );

      if (data.type === "chat") {
        addChatMessage(
          data.name || "Viewer",
          data.message
        );
      }
    } catch (error) {
      console.error("Chat message error:", error);
    }
  }
);
    // Let LiveKit open and publish the camera and microphone.
    await room.localParticipant.enableCameraAndMicrophone();
    
console.log("Camera published:", room.localParticipant.isCameraEnabled);
console.log("Microphone published:", room.localParticipant.isMicrophoneEnabled);
    const video = document.getElementById("previewVideo");

    const publication =
      room.localParticipant.getTrackPublication(
        LivekitClient.Track.Source.Camera
      );

    if (publication && publication.track && video) {
      publication.track.attach(video);
    }

    const liveButton =
      document.getElementById("goLiveButton");

    if (liveButton) {
      liveButton.innerText = "🔴 LIVE";
    }

    alert("🔴 EMAN LIVE is now LIVE!");

    console.log("Live room:", roomName);

  } catch (error) {
    console.error("LiveKit error:", error);

    alert(
      "LiveKit error: " +
      (error.message || error)
    );
  }
}

async function stopLive() {
  try {
    if (room) {
      await room.disconnect();
      room = null;
    }

    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack = null;
    }

    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });

      cameraStream = null;
    }

    const video =
      document.getElementById("previewVideo");

    if (video) {
      video.srcObject = null;
    }

    const liveButton =
      document.getElementById("goLiveButton");

    if (liveButton) {
      liveButton.innerText = "🔴 GO LIVE";
    }

    alert("Live stream ended.");

  } catch (error) {
    console.error(error);
    alert("Could not end the live stream.");
  }
}
async function watchLive() {
  try {
    if (!window.LivekitClient) {
      alert("LiveKit is not loaded.");
      return;
    }

    const tokenSource =
      LivekitClient.TokenSource.developmentTokenServer(
        TOKEN_SERVER_ID
      );

    const credentials = await tokenSource.fetch({
      roomName: "eman-live-main",
      participantName: "Eman Viewer"
    });

    const viewerRoom = new LivekitClient.Room();
viewerRoom.on(
  LivekitClient.RoomEvent.DataReceived,
  (payload, participant) => {
    try {
      const data = JSON.parse(
        new TextDecoder().decode(payload)
      );

      if (data.type === "chat") {
        addChatMessage(
          data.name || "User",
          data.message
        );
      }
    } catch (error) {
      console.error("Chat receive error:", error);
    }
  }
);
    function showVideo(track) {
      if (!track || track.kind !== LivekitClient.Track.Kind.Video) {
        return;
      }

      const rooms = document.getElementById("rooms");

      if (!rooms) return;

      rooms.innerHTML = "";

      const video = document.createElement("video");

      video.autoplay = true;
      video.playsInline = true;
      video.controls = false;
      video.style.width = "100%";
      video.style.maxWidth = "600px";
      video.style.borderRadius = "15px";
      video.style.background = "#000";

      track.attach(video);

      rooms.appendChild(video);

      video.play().catch(() => {});

      console.log("Host video displayed.");
    }

    viewerRoom.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (track) => {
        showVideo(track);
      }
    );

    await viewerRoom.connect(
      credentials.serverUrl,
      credentials.participantToken
    );

    // Check tracks that are already available.
    viewerRoom.remoteParticipants.forEach(
      (participant) => {

        participant.trackPublications.forEach(
          (publication) => {

            if (publication.track) {
              showVideo(publication.track);
            }

          }
        );

      }
    );

    alert("👀 You joined Eman Live!");

  } catch (error) {
    console.error("Viewer error:", error);

    alert(
      "Viewer error: " +
      (error.message || error)
    );
  }
}
function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  if (!input || !messages) return;

  const message = input.value.trim();

  if (!message) return;

  const newMessage = document.createElement("p");

  newMessage.innerHTML =
    "<b>You:</b> " + message;

  messages.appendChild(newMessage);

  input.value = "";

  messages.scrollTop = messages.scrollHeight;
}
async function sendLiveChat() {
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  if (!input || !messages || !room) {
    return;
  }

  const message = input.value.trim();

  if (!message) {
    return;
  }

  const data = new TextEncoder().encode(
    JSON.stringify({
      type: "chat",
      name: "User",
      message: message
    })
  );

  await room.localParticipant.publishData(
    data,
    {
      reliable: true
    }
  );

  addChatMessage("You", message);

  input.value = "";
}

function addChatMessage(name, message) {
  const messages = document.getElementById("chatMessages");

  if (!messages) return;

  const p = document.createElement("p");

  p.innerHTML =
    "<b>" + name + ":</b> " + message;

  messages.appendChild(p);
}
