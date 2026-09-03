const TOKEN_SERVER_ID = "emanlive-2j2epi";

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
      alert("LiveKit is not loaded. Please refresh the page.");
      return;
    }

    const tokenSource =
      LivekitClient.TokenSource.developmentTokenServer(
        TOKEN_SERVER_ID
      );

    const roomName = "eman-live-" + Date.now();

    const credentials = await tokenSource.fetch({
      roomName: roomName,
      participantName: "Eman Host"
    });

    room = new LivekitClient.Room();

    await room.connect(
      credentials.serverUrl,
      credentials.participantToken
    );

    localVideoTrack =
      await LivekitClient.createLocalVideoTrack();

    localAudioTrack =
      await LivekitClient.createLocalAudioTrack();

    await room.localParticipant.publishTrack(
      localVideoTrack
    );

    await room.localParticipant.publishTrack(
      localAudioTrack
    );

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = new MediaStream([
        localVideoTrack.mediaStreamTrack
      ]);

      video.muted = true;
      video.playsInline = true;

      await video.play();
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
