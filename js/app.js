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

function startCamera() {
  alert("Camera button is working!");
}

function goLive() {
  alert("GO LIVE button is working!");
}

function stopLive() {
  alert("END LIVE button is working!");
}
