const TOKEN_SERVER_ID = "emanlive-2j2epi";

let currentRoomName = null;
let room = null;
let viewerRoom = null;
let localVideoTrack = null;
let localAudioTrack = null;
let cameraStream = null;


// =========================
// MODALS
// =========================

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


// =========================
// GIFTS
// =========================

function gift(name, cost) {
  alert(name + " selected — " + cost + " coins");
}


// =========================
// CAMERA PREVIEW
// =========================

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

    alert(
      "Camera could not start: " +
      (error.message || error)
    );
  }
}


// =========================
// GO LIVE
// =========================

async function goLive() {
  try {

    if (!window.LivekitClient) {
      alert("LiveKit is not loaded. Please refresh the page.");
      return;
    }

    // Stop preview camera before LiveKit opens camera
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

    // Receive chat from viewers
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

          console.error(
            "Chat receive error:",
            error
          );

        }

      }
    );


    // Viewer joins
    room.on(
      LivekitClient.RoomEvent.ParticipantConnected,
      () => {
        updateViewerCount();
      }
    );


    // Viewer leaves
    room.on(
      LivekitClient.RoomEvent.ParticipantDisconnected,
      () => {
        updateViewerCount();
      }
    );


    await room.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    // Turn on camera and microphone
    await room.localParticipant.enableCameraAndMicrophone();


    // Show host camera
    const video =
      document.getElementById("previewVideo");

    const publication =
      room.localParticipant.getTrackPublication(
        LivekitClient.Track.Source.Camera
      );

    if (
      publication &&
      publication.track &&
      video
    ) {

      publication.track.attach(video);

      video.muted = true;
      video.playsInline = true;

      await video.play().catch(() => {});

    }


    updateViewerCount();


    const liveButton =
      document.getElementById("goLiveButton");

    if (liveButton) {
      liveButton.innerText = "🔴 LIVE";
    }


    alert("🔴 EMAN LIVE is now LIVE!");

    console.log(
      "Eman Live room:",
      roomName
    );

  } catch (error) {

    console.error(
      "LiveKit error:",
      error
    );

    alert(
      "LiveKit error: " +
      (error.message || error)
    );

  }
}


// =========================
// VIEWER COUNT
// =========================

function updateViewerCount() {

  if (!room) return;

  const count =
    room.remoteParticipants.size + 1;

  const viewerCount =
    document.getElementById("viewerCount");

  if (viewerCount) {
    viewerCount.innerText = count;
  }

  console.log(
    "Viewer count:",
    count
  );
}


// =========================
// WATCH LIVE
// =========================

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


    const credentials =
      await tokenSource.fetch({

        roomName: "eman-live-main",

        participantName: "Eman Viewer"

      });


    viewerRoom =
      new LivekitClient.Room();


    // Receive host video
    viewerRoom.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (track, publication, participant) => {

        if (
          track.kind ===
          LivekitClient.Track.Kind.Video
        ) {

          showViewerVideo(track);

        }

      }
    );


    await viewerRoom.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    // Check host tracks that already exist
    viewerRoom.remoteParticipants.forEach(
      participant => {

        participant.trackPublications.forEach(
          publication => {

            if (publication.track) {

              showViewerVideo(
                publication.track
              );

            }

          }
        );

      }
    );


    alert("👀 You joined Eman Live!");


  } catch (error) {

    console.error(
      "Viewer error:",
      error
    );

    alert(
      "Viewer error: " +
      (error.message || error)
    );

  }
}


// =========================
// SHOW VIEWER VIDEO
// =========================

function showViewerVideo(track) {

  if (
    !track ||
    track.kind !==
    LivekitClient.Track.Kind.Video
  ) {
    return;
  }


  const rooms =
    document.getElementById("rooms");

  if (!rooms) return;


  rooms.innerHTML = "";


  const video =
    document.createElement("video");


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


  console.log(
    "Host video displayed."
  );
}


// =========================
// CHAT
// =========================

async function sendLiveChat() {

  const input =
    document.getElementById("chatInput");

  const messages =
    document.getElementById("chatMessages");


  if (!input || !messages) {
    return;
  }


  const message =
    input.value.trim();


  if (!message) {
    return;
  }


  const activeRoom =
    room || viewerRoom;


  if (!activeRoom) {

    alert(
      "You must join a live room first."
    );

    return;

  }


  const data =
    new TextEncoder().encode(

      JSON.stringify({

        type: "chat",

        name: "User",

        message: message

      })

    );


  await activeRoom.localParticipant.publishData(
    data,
    {
      reliable: true
    }
  );


  addChatMessage(
    "You",
    message
  );


  input.value = "";

}


// =========================
// DISPLAY CHAT MESSAGE
// =========================

function addChatMessage(
  name,
  message
) {

  const messages =
    document.getElementById("chatMessages");


  if (!messages) return;


  const p =
    document.createElement("p");


  p.textContent =
    name + ": " + message;


  messages.appendChild(p);


  messages.scrollTop =
    messages.scrollHeight;

}


// Compatibility with old button
function sendChatMessage() {
  sendLiveChat();
}


// =========================
// END LIVE
// =========================

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

      cameraStream
        .getTracks()
        .forEach(track => track.stop());

      cameraStream = null;

    }


    const video =
      document.getElementById(
        "previewVideo"
      );


    if (video) {

      video.srcObject = null;

    }


    const liveButton =
      document.getElementById(
        "goLiveButton"
      );


    if (liveButton) {

      liveButton.innerText =
        "🔴 GO LIVE";

    }


    alert(
      "Live stream ended."
    );


  } catch (error) {

    console.error(
      "End live error:",
      error
    );

  }

}
