const LIVEKIT_URL = "wss://eman-live-ckbb612s.livekit.cloud";
const TOKEN_SERVER_ID = "emanlive-2j2epi";

let room = null;
let localVideoTrack = null;
let localAudioTrack = null;

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

    alert("Camera is working!");
  } catch (error) {
    console.error(error);
    alert("Camera could not start: " + error.message);
  }
}

function goLive() {
  alert("Camera is ready. Live streaming is the next step.");
}

function stopLive() {
  alert("END LIVE button is working!");
}
