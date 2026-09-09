// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
  "https://kzuaaihvehqhipwmrzal.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LsGL8Os9cgqLmItWgk0ADg_nBWuLs7I";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ============================================
// SUPABASE USER SESSION
// ============================================

let currentSupabaseUser = null;

async function initializeSupabaseUser() {

  try {

    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (session && session.user) {

      currentSupabaseUser = session.user;

      console.log(
        "Supabase user:",
        currentSupabaseUser.id
      );

      return currentSupabaseUser;
    }

    const {
      data,
      error
    } = await supabaseClient.auth.signInAnonymously();

    if (error) {
      console.error(
        "Supabase anonymous sign-in error:",
        error
      );

      toast(
        "Unable to connect your account."
      );

      return null;
    }

    currentSupabaseUser = data.user;

    console.log(
      "New Supabase user:",
      currentSupabaseUser.id
    );

    return currentSupabaseUser;

  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    return null;
  }
}

/* =========================================================
   EMAN LIVE
   CLEAN BUTTON SYSTEM
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  appName: "Eman Live",

  usdtAddress:
    "0xec05bb37867f5e75a706a1face5304fd40a8f54c",

  network:
    "BNB Smart Chain · BEP20",

  livekitUrl:
    "wss://eman-live-ckbb612s.livekit.cloud",

  tokenServer:
    "https://emanlive-2j2epi.sandbox.livekit.io"
};


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "eman_live_clean_v1";


const defaultState = {
  page: "home",

  meTab: "profile",

  walletTab: "buy",

  coins: 0,

  beans: 0,

  wealthXP: 0,

  charmXP: 0,

  profile: {
    name: "Eman User",
    username: "emanuser",
    id: "EMAN100001",
    bio: "Welcome to Eman Live!",
    gender: "",
    birthday: "",
    country: "Trinidad and Tobago",
    language: "English",
    avatar: "",
    album: []
  },

  rechargeHistory: [],

  giftHistory: [],

  withdrawalHistory: [],

  messages: [],

  moments: [],

  currentCover: "",

  currentStream: null
};


let state = loadState();


function loadState() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultState);
    }

    return {
      ...structuredClone(defaultState),
      ...JSON.parse(saved)
    };

  } catch (error) {

    console.error(error);

    return structuredClone(defaultState);
  }
}


function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

  updateHeaderCoins();
}


/* =========================================================
   DEMO HOSTS
========================================================= */

const hosts = [

  {
    id: 1,
    name: "Mia",
    username: "@mia_live",
    viewers: 1240,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  },

  {
    id: 2,
    name: "Aaliyah",
    username: "@aaliyah",
    viewers: 892,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
  },

  {
    id: 3,
    name: "Jasmine",
    username: "@jasmine_live",
    viewers: 764,
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80"
  },

  {
    id: 4,
    name: "Sofia",
    username: "@sofia",
    viewers: 521,
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80"
  }

];


/* =========================================================
   GIFTS
========================================================= */

const gifts = [

  {
    name: "Rose",
    icon: "🌹",
    coins: 10,
    category: "Popular"
  },

  {
    name: "Heart",
    icon: "❤️",
    coins: 20,
    category: "Love"
  },

  {
    name: "Kiss",
    icon: "💋",
    coins: 50,
    category: "Love"
  },

  {
    name: "Crown",
    icon: "👑",
    coins: 100,
    category: "Luxury"
  },

  {
    name: "Diamond",
    icon: "💎",
    coins: 500,
    category: "Luxury"
  },

  {
    name: "Car",
    icon: "🏎️",
    coins: 1000,
    category: "Luxury"
  },

  {
    name: "Fire",
    icon: "🔥",
    coins: 30,
    category: "Fun"
  },

  {
    name: "Party",
    icon: "🎉",
    coins: 75,
    category: "Fun"
  },

  {
    name: "Star",
    icon: "⭐",
    coins: 25,
    category: "Popular"
  },

  {
    name: "Gift",
    icon: "🎁",
    coins: 150,
    category: "Popular"
  },

  {
    name: "Rocket",
    icon: "🚀",
    coins: 300,
    category: "Luxury"
  },

  {
    name: "Unicorn",
    icon: "🦄",
    coins: 700,
    category: "Luxury"
  },

  {
    name: "Love",
    icon: "💖",
    coins: 40,
    category: "Love"
  },

  {
    name: "Laugh",
    icon: "😂",
    coins: 15,
    category: "Fun"
  }

];


/* =========================================================
   HELPERS
========================================================= */

const screen =
  document.getElementById("screen");


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function toast(message) {

  const el =
    document.getElementById("toast");

  el.textContent = message;

  el.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {

      el.classList.remove("show");

    }, 2500);
}


function updateHeaderCoins() {

  const el =
    document.getElementById("headerCoins");

  if (el) {
    el.textContent =
      Number(state.coins).toLocaleString();
  }
}


function money(value) {

  return "$" +
    Number(value).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    );
}


function activateNav() {

  document
    .querySelectorAll(".nav-button")
    .forEach(button => {

      button.classList.remove("active");

    });

  const map = {
    home: "navHome",
    live: "navLive",
    chat: "navChat",
    me: "navMe"
  };

  const id = map[state.page];

  if (id) {

    const button =
      document.getElementById(id);

    if (button) {
      button.classList.add("active");
    }
  }
}


/* =========================================================
   ROUTING
========================================================= */

function go(page) {

  state.page = page;

  render();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

  updateHeaderCoins();

  activateNav();

  switch (state.page) {

    case "home":
      renderHome();
      break;

    case "live":
      renderLive();
      break;

    case "chat":
      renderChat();
      break;

    case "me":
      renderMe();
      break;

    case "party":
      renderParty();
      break;

    case "moments":
      renderMoments();
      break;

    case "setup":
      renderLiveSetup();
      break;

    case "partySetup":
      renderPartySetup();
      break;

    default:
      renderHome();
  }
}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

  screen.innerHTML = `

    <div class="hero">

      <h1>Popular Live Hosts</h1>

      <p>
        Watch your favorite hosts online,
        send gifts and enjoy Eman Live.
      </p>

      <button
        class="primary-btn"
        data-action="live">
        🔴 Go Live
      </button>

    </div>


    <div class="section">

      <div class="section-header">
        <h2>Explore</h2>
      </div>

      <div class="action-grid">

        <button
          class="action-card"
          data-action="party">

          <span class="icon">🎥</span>

          <strong>Party Room</strong>

          <span>
            Join popular multi-video rooms
          </span>

        </button>


        <button
          class="action-card"
          data-action="moments">

          <span class="icon">📸</span>

          <strong>Moment</strong>

          <span>
            Photos and videos from hosts
          </span>

        </button>


        <button
          class="action-card"
          data-action="chat">

          <span class="icon">💬</span>

          <strong>Inbox</strong>

          <span>
            Your private messages
          </span>

        </button>


        <button
          class="action-card"
          data-action="me">

          <span class="icon">👤</span>

          <strong>Me</strong>

          <span>
            Profile, wallet and income
          </span>

        </button>

      </div>

    </div>


    <div class="section">

      <div class="section-header">

        <h2>Popular Hosts Online</h2>

        <button
          class="secondary-btn small-btn"
          data-action="live">
          View Live
        </button>

      </div>

      <div class="host-grid">

        ${hosts.map(hostCard).join("")}

      </div>

    </div>

  `;
}


function hostCard(host) {

  return `

    <article class="host-card">

      <button
        style="display:block;width:100%;background:none;color:white;text-align:left"
        data-action="watch"
        data-id="${host.id}">

        <div class="host-cover">

          <img
            src="${host.image}"
            alt="${escapeHTML(host.name)}">

          <span class="live-badge">
            LIVE
          </span>

          <span class="viewer-badge">
            👁 ${host.viewers.toLocaleString()}
          </span>

        </div>

        <div class="host-info">

          <strong>
            ${escapeHTML(host.name)}
          </strong>

          <span>
            ${escapeHTML(host.username)}
          </span>

        </div>

      </button>

    </article>

  `;
}


/* =========================================================
   LIVE PAGE
========================================================= */

function renderLive() {

  screen.innerHTML = `

    <h1 class="page-title">
      Go Live
    </h1>

    <p class="page-subtitle">
      Choose how you want to go live.
    </p>


    <div class="option-grid">

      <div class="option-card">

        <div class="big-icon">
          📱
        </div>

        <h2>Solo Live</h2>

        <p>
          Start your own live stream
          with your camera.
        </p>

        <button
          class="primary-btn"
          data-action="soloSetup">

          Start Solo Live

        </button>

      </div>


      <div class="option-card">

        <div class="big-icon">
          🎥
        </div>

        <h2>Party Room</h2>

        <p>
          Start a multi-video party room
          with other users.
        </p>

        <button
          class="primary-btn"
          data-action="partySetup">

          Start Party Room

        </button>

      </div>

    </div>


    <div class="section">

      <h2 style="margin-bottom:12px">
        Popular Party Rooms
      </h2>

      ${partyRoomCards()}

    </div>

  `;
}


/* =========================================================
   PARTY ROOM CARDS
========================================================= */

function partyRoomCards() {

  const rooms = [

    {
      name: "Girls Night",
      users: 4,
      viewers: 1850,
      image: hosts[0].image
    },

    {
      name: "Music Party",
      users: 3,
      viewers: 1240,
      image: hosts[1].image
    },

    {
      name: "Late Night",
      users: 4,
      viewers: 970,
      image: hosts[2].image
    }

  ];


  return rooms.map(room => `

    <div class="party-room">

      <div class="party-cover">

        <img src="${room.image}">

        <span class="live-badge">
          LIVE
        </span>

        <span class="viewer-badge">
          👁 ${room.viewers.toLocaleString()}
        </span>

      </div>

      <div class="party-content">

        <h3>
          ${room.name}
        </h3>

        <p>
          ${room.users} people in the room
        </p>

        <button
          class="primary-btn"
          data-action="joinParty"
          data-name="${escapeHTML(room.name)}">

          Join Party Room

        </button>

      </div>

    </div>

  `).join("");
}


/* =========================================================
   SOLO SETUP
========================================================= */

function renderLiveSetup() {

  screen.innerHTML = `

    <h1 class="page-title">
      Solo Live Setup
    </h1>

    <p class="page-subtitle">
      Your camera and cover photo are required.
    </p>


    <div class="form-card">

      <div class="camera-box">

        <video
          id="setupCamera"
          autoplay
          muted
          playsinline>
        </video>

        <div
          id="cameraMessage"
          class="camera-message">

          Camera preview will appear here.

        </div>

      </div>


      <button
        class="secondary-btn"
        data-action="camera">

        📷 Open Camera

      </button>

    </div>


    <div class="form-card">

      <div class="form-group">

        <label>
          Live Cover Photo *
        </label>

        <div
          id="coverPreview"
          class="cover-preview">

          Select a cover photo

        </div>

        <input
          id="coverInput"
          class="input"
          type="file"
          accept="image/*">

      </div>


      <div class="form-group">

        <label>
          Live Title *
        </label>

        <input
          id="liveTitle"
          class="input"
          placeholder="Enter your live title">

      </div>


      <div class="form-group">

        <label>
          Category
        </label>

        <select
          id="liveCategory"
          class="input">

          <option>Chat</option>
          <option>Music</option>
          <option>Entertainment</option>
          <option>Gaming</option>
          <option>Lifestyle</option>

        </select>

      </div>


      <button
        class="primary-btn"
        data-action="startSolo">

        🔴 Start Live

      </button>

    </div>


    <button
      class="secondary-btn"
      data-action="live">

      ← Back

    </button>

  `;

  startCameraPreview();
}


/* =========================================================
   CAMERA
========================================================= */

let cameraStream = null;


async function startCameraPreview() {

  const video =
    document.getElementById("setupCamera");

  const message =
    document.getElementById("cameraMessage");

  if (!video) return;

  try {

    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

    video.srcObject =
      cameraStream;

    if (message) {
      message.style.display = "none";
    }

  } catch (error) {

    console.error(error);

    if (message) {

      message.style.display = "flex";

      message.innerHTML =
        "Camera permission was not granted.<br><br>" +
        "Tap Open Camera and allow camera access.";
    }
  }
}


async function openCameraAgain() {

  await startCameraPreview();

  toast("Camera started");
}


function stopCamera() {

  if (!cameraStream) return;

  cameraStream
    .getTracks()
    .forEach(track => track.stop());

  cameraStream = null;
}


/* =========================================================
   COVER PREVIEW
========================================================= */

function setupCoverInput() {

  const input =
    document.getElementById("coverInput");

  if (!input) return;

  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = () => {

        state.currentCover =
          reader.result;

        const preview =
          document.getElementById(
            "coverPreview"
          );

        if (preview) {

          preview.innerHTML = `

            <img
              src="${reader.result}"
              alt="Cover preview">

          `;
        }
      };

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   START SOLO
========================================================= */

function startSoloLive() {

  const title =
    document.getElementById("liveTitle")
      ?.value
      .trim();

  if (!title) {

    toast("Please enter a live title.");

    return;
  }

  if (!state.currentCover) {

    toast("Please select a live cover photo.");

    return;
  }

  state.currentStream = {
    type: "solo",
    title: title,
    cover: state.currentCover,
    startedAt: Date.now(),
    viewers: 0,
    hearts: 0
  };

  saveState();

  renderOwnStream();

}


/* =========================================================
   OWN STREAM
========================================================= */

function renderOwnStream() {

  const stream =
    state.currentStream;

  screen.innerHTML = `

    <div class="stream-room">

      <div class="stream-top">

        <div class="stream-info">

          <img
            class="stream-avatar"
            src="${state.profile.avatar || hosts[0].image}">

          <div>

            <strong>
              ${escapeHTML(state.profile.name)}
            </strong>

            <div style="color:#ff5270;font-size:12px">
              🔴 LIVE
            </div>

          </div>

        </div>

        <button
          class="danger-btn small-btn"
          data-action="endLive">

          End Live

        </button>

      </div>


      <div class="stream-stage">

        <video
          id="liveVideo"
          autoplay
          muted
          playsinline>
        </video>

      </div>


      <div class="stream-stats">

        <div class="stream-stat">
          👁 <span id="liveViewers">0</span>
        </div>

        <div class="stream-stat">
          ❤️ <span id="liveHearts">0</span>
        </div>

        <div class="stream-stat">
          🪙 ${state.coins.toLocaleString()}
        </div>

      </div>


      <div class="stream-chat">

        <p>
          <strong>System:</strong>
          Your live stream has started.
        </p>

        <p>
          <strong>System:</strong>
          Viewers can send gifts here.
        </p>

      </div>


      <div class="stream-controls">

        <button
          class="secondary-btn"
          data-action="sendGift">

          🎁 Gifts

        </button>

        <button
          class="secondary-btn"
          data-action="heart">

          ❤️ Send Heart

        </button>

      </div>

    </div>

  `;

  activateOwnVideo();

}


function activateOwnVideo() {

  const video =
    document.getElementById("liveVideo");

  if (!video || !cameraStream) return;

  video.srcObject =
    cameraStream;
}


function endLive() {

  stopCamera();

  state.currentStream = null;

  state.currentCover = "";

  saveState();

  toast("Live ended.");

  go("home");
}


/* =========================================================
   PARTY SETUP
========================================================= */

function renderPartySetup() {

  screen.innerHTML = `

    <h1 class="page-title">
      Party Room Setup
    </h1>

    <p class="page-subtitle">
      Camera and cover photo are required.
    </p>


    <div class="form-card">

      <div class="camera-box">

        <video
          id="partyCamera"
          autoplay
          muted
          playsinline>
        </video>

        <div
          id="partyCameraMessage"
          class="camera-message">

          Camera preview will appear here.

        </div>

      </div>


      <button
        class="secondary-btn"
        data-action="camera">

        📷 Open Camera

      </button>

    </div>


    <div class="form-card">

      <div class="form-group">

        <label>
          Party Cover Photo *
        </label>

        <div
          id="partyCoverPreview"
          class="cover-preview">

          Select a cover photo

        </div>

        <input
          id="partyCoverInput"
          class="input"
          type="file"
          accept="image/*">

      </div>


      <div class="form-group">

        <label>
          Party Room Name *
        </label>

        <input
          id="partyTitle"
          class="input"
          placeholder="Enter party room name">

      </div>


      <button
        class="primary-btn"
        data-action="startParty">

        🎥 Start Party Room

  
