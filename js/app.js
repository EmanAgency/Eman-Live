const LIVEKIT_URL = "wss://eman-live-ckbb612s.livekit.cloud";

let localStream = null;
let liveStarted = false;

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
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = localStream;
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

function goLive() {
  if (!localStream) {
    alert("Please start your camera first.");
    return;
  }

  liveStarted = true;

  alert("🔴 Eman Live is now LIVE!");

  const liveButton = document.getElementById("goLiveButton");

  if (liveButton) {
    liveButton.innerText = "🔴 LIVE";
  }
}

function stopLive() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  liveStarted = false;

  const video = document.getElementById("previewVideo");

  if (video) {
    video.srcObject = null;
  }

  alert("Live stream ended.");
}
