const LIVEKIT_URL = "wss://eman-live-ckbb612s.livekit.cloud";
const TOKEN_SERVER_URL = "https://emanlive-2j2epi.sandbox.livekit.io";

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
      alert("LiveKit is still loading. Please refresh the page.");
      return;
    }

    const roomName = "eman-live-" + Date.now();

    const response = await fetch(
      TOKEN_SERVER_URL + "/getToken?roomName=" +
      encodeURIComponent(roomName) +
      "&participantName=Host"
    );

    if (!response.ok) {
      throw new Error("Could not get LiveKit token.");
    }

    const data = await response.json();

    room = new LivekitClient.Room();

    await room.connect(LIVEKIT_URL, data.token);

    const camera = await LivekitClient.createLocalVideoTrack();
    const microphone = await LivekitClient.createLocalAudioTrack();

    await room.localParticipant.publishTrack(camera);
    await room.localParticipant.publishTrack(microphone);

    localVideoTrack = camera;
    localAudioTrack = microphone;

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = new MediaStream([
        camera.mediaStreamTrack
      ]);

      video.muted = true;
      video.playsInline = true;
      await video.play();
    }

    const liveButton = document.getElementById("goLiveButton");

    if (liveButton) {
      liveButton.innerText = "🔴 LIVE";
    }

    alert("🔴 Eman Live is now LIVE!");

    console.log("Connected to LiveKit room:", roomName);

  } catch (error) {
    console.error("LiveKit error:", error);
    alert("Could not start the live stream. Check your connection and try again.");
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

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = null;
    }

    const liveButton = document.getElementById("goLiveButton");

    if (liveButton) {
      liveButton.innerText = "GO LIVE";
    }

    alert("Live stream ended.");

  } catch (error) {
    console.error(error);
  }
}
