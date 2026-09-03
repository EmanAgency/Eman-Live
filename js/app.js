const LIVEKIT_URL = "wss://eman-live-ckbb612s.livekit.cloud";
const TOKEN_SERVER_ID = "emanlive-2j2epi";

let room = null;
let localVideoTrack = null;
let localAudioTrack = null;

function openLive() {
  document.getElementById("liveModal").classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function openParty() {
  document.getElementById("partyModal").classList.add("open");
}

function openGifts() {
  document.getElementById("giftModal").classList.add("open");
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
    }

    console.log("Camera and microphone ready.");
  } catch (error) {
    console.error(error);
    alert("Camera or microphone permission was denied.");
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

    alert("🔴 Eman Live is now LIVE!");

    console.log("Connected to Eman Live room:", roomName);

  } catch (error) {
    console.error("LiveKit error:", error);
    alert(
      alert("LiveKit error: " + error.message);
  }
}

async function stopLive() {
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

  const video = document.getElementById("previewVideo");

  if (video) {
    video.srcObject = null;
  }

  const liveButton =
    document.getElementById("goLiveButton");

  if (liveButton) {
    liveButton.innerText = "GO LIVE";
  }

  alert("Live stream ended.");
}
