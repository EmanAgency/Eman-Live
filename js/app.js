"use strict";

/* =========================================================
   EMAN LIVE
   COMPLETE APP
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://kzuaaihvehqhipwmrzal.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LsGL8Os9cgqLmItWgk0ADg_nBWuLs7I";

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
} else {
  console.error(
    "Supabase library was not loaded."
  );
}

let currentSupabaseUser = null;


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
   SUPABASE USER
========================================================= */

async function initializeSupabaseUser() {

  if (!supabaseClient) {
    console.warn(
      "Supabase is unavailable. App will continue without it."
    );
    return null;
  }

  try {

    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();


    if (session?.user) {

      currentSupabaseUser =
        session.user;

      console.log(
        "Supabase user:",
        currentSupabaseUser.id
      );

      return currentSupabaseUser;

    }


    const {
      data,
      error
    } =
      await supabaseClient.auth.signInAnonymously();


    if (error) {

      console.error(
        "Anonymous login error:",
        error
      );

      toast(
        "Could not connect to Eman Live."
      );

      return null;

    }


    currentSupabaseUser =
      data.user;


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
   STORAGE
========================================================= */

const STORAGE_KEY =
  "eman_live_clean_v2";


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

  currentStream: null,

  pendingPayment: null

};


function loadState() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {

      return structuredClone(
        defaultState
      );

    }


    const parsed =
      JSON.parse(saved);


    return {

      ...structuredClone(
        defaultState
      ),

      ...parsed,

      profile: {

        ...structuredClone(
          defaultState.profile
        ),

        ...(parsed.profile || {})

      }

    };


  } catch (error) {

    console.error(error);

    return structuredClone(
      defaultState
    );

  }

}


let state =
  loadState();


function saveState() {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(state)

  );

  updateHeaderCoins();

}


/* =========================================================
   HOSTS
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
  document.getElementById(
    "screen"
  );


function escapeHTML(value) {

  return String(value ?? "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

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


function toast(message) {

  const el =
    document.getElementById(
      "toast"
    );

  if (!el) return;

  el.textContent =
    message;

  el.classList.add("show");

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer =
    setTimeout(() => {

      el.classList.remove(
        "show"
      );

    }, 2600);

}


function updateHeaderCoins() {

  const el =
    document.getElementById(
      "headerCoins"
    );

  if (el) {

    el.textContent =
      Number(
        state.coins
      ).toLocaleString();

  }

}


function activateNav() {

  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(button => {

      button.classList.remove(
        "active"
      );

    });


  const map = {

    home: "navHome",

    live: "navLive",

    chat: "navChat",

    me: "navMe"

  };


  const id =
    map[state.page];


  if (id) {

    document
      .getElementById(id)
      ?.classList.add(
        "active"
      );

  }

}


/* =========================================================
   ROUTING
========================================================= */

function go(page) {

  stopCamera();

  state.page =
    page;

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

      <h1>
        Popular Live Hosts
      </h1>

      <p>
        Watch your favorite hosts online,
        send gifts and enjoy Eman Live.
      </p>

      <button
        class="primary-btn"
        data-action="live"
        type="button">

        🔴 Go Live

      </button>

    </div>


    <div class="section">

      <div class="section-header">

        <h2>
          Explore
        </h2>

      </div>


      <div class="action-grid">

        <button
          class="action-card"
          data-action="party"
          type="button">

          <span class="icon">
            🎥
          </span>

          <strong>
            Party Room
          </strong>

          <span>
            Join popular multi-video rooms
          </span>

        </button>


        <button
          class="action-card"
          data-action="moments"
          type="button">

          <span class="icon">
            📸
          </span>

          <strong>
            Moment
          </strong>

          <span>
            Photos and videos from hosts
          </span>

        </button>


        <button
          class="action-card"
          data-action="chat"
          type="button">

          <span class="icon">
            💬
          </span>

          <strong>
            Inbox
          </strong>

          <span>
            Your private messages
          </span>

        </button>


        <button
          class="action-card"
          data-action="me"
          type="button">

          <span class="icon">
            👤
          </span>

          <strong>
            Me
          </strong>

          <span>
            Profile, wallet and income
          </span>

        </button>

      </div>

    </div>


    <div class="section">

      <div class="section-header">

        <h2>
          Popular Hosts Online
        </h2>

        <button
          class="secondary-btn small-btn"
          data-action="live"
          type="button">

          View Live

        </button>

      </div>


      <div class="host-grid">

        ${hosts.map(
          hostCard
        ).join("")}

      </div>

    </div>

  `;

}


function hostCard(host) {

  return `

    <article class="host-card">

      <button
        style="
          display:block;
          width:100%;
          background:none;
          color:white;
          text-align:left;
        "
        data-action="watch"
        data-id="${host.id}"
        type="button">

        <div class="host-cover">

          <img
            src="${host.image}"
            alt="${escapeHTML(host.name)}">

          <span class="live-badge">
            LIVE
          </span>

          <span class="viewer-badge">
            👁
            ${host.viewers.toLocaleString()}
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
      🔴 Live
    </h1>

    <p class="page-subtitle">
      Watch live streamers or start your own live stream.
    </p>


    <div class="option-grid">

      <div class="option-card">

        <div class="big-icon">
          📱
        </div>

        <h2>
          Solo Live
        </h2>

        <p>
          Start your own live stream
          with your camera.
        </p>

        <button
          class="primary-btn"
          data-action="soloSetup"
          type="button">

          🔴 Start Solo Live

        </button>

      </div>

    </div>


    <div class="section">

      <h2 style="margin-bottom:12px;">
        🔴 Live Now
      </h2>

      <div id="liveStreamList">

        <div class="form-card">

          <p>
            Loading live streamers...
          </p>

        </div>

      </div>

    </div>

  `;


  /*
   * Load actual live streamers
   */

  liveRoomCards();

}



/* =========================================================
   LIVE STREAM CARDS
========================================================= */

async function liveRoomCards() {

  const container =
    document.getElementById("liveStreamList");

  if (!container) return;

  container.innerHTML = `
    <div class="form-card">
      <p>Loading live streamers...</p>
    </div>
  `;


  try {

    const { data, error } =
      await supabase
        .from("live_rooms")
        .select("*")
        .eq("is_live", true)
        .eq("status", "live")
        .eq("live_type", "live")
        .order("created_at", {
          ascending: false
        });


    if (error) {

      console.error(
        "Live rooms error:",
        error
      );

      container.innerHTML = `
        <div class="form-card">
          <p>
            Unable to load live streamers.
          </p>
          <p style="color:#aaa;font-size:13px;">
            ${escapeHTML(error.message)}
          </p>
        </div>
      `;

      return;
    }


    if (!data || data.length === 0) {

      container.innerHTML = `
        <div class="form-card">

          <h3>
            🔴 No one is live right now
          </h3>

          <p style="color:#aaa;">
            When a streamer starts a live stream,
            they will appear here.
          </p>

        </div>
      `;

      return;
    }


    container.innerHTML =
      data.map(room => `

        <div class="party-room">

          <div class="party-cover">

            ${
              room.cover_photo
                ? `
                  <img
                    src="${room.cover_photo}"
                    alt="${escapeHTML(room.title || "Live Stream")}"
                  >
                `
                : `
                  <div style="
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:50px;
                  ">
                    📱
                  </div>
                `
            }

            <span class="live-badge">
              🔴 LIVE
            </span>

            <span class="viewer-badge">
              👁
              ${Number(room.viewer_count || 0)}
            </span>

          </div>


          <div class="party-content">

            <h3>
              ${escapeHTML(room.title || "Live Stream")}
            </h3>

            <p>
              ${escapeHTML(room.host_name || "Eman Host")}
            </p>

            <button
              class="primary-btn"
              data-action="joinLive"
              data-room="${escapeHTML(room.room_name || "")}"
              data-id="${escapeHTML(room.id || "")}"
              type="button">

              ▶ Watch Live

            </button>

          </div>

        </div>

      `).join("");


  } catch (error) {

    console.error(
      "LIVE ROOM LOAD ERROR:",
      error
    );

    container.innerHTML = `
      <div class="form-card">
        <p>
          Unable to load live streams.
        </p>
      </div>
    `;

  }

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

        <img
          src="${room.image}"
          alt="${escapeHTML(room.name)}">

        <span class="live-badge">
          LIVE
        </span>

        <span class="viewer-badge">
          👁
          ${room.viewers.toLocaleString()}
        </span>

      </div>


      <div class="party-content">

        <h3>
          ${escapeHTML(room.name)}
        </h3>

        <p>
          ${room.users}
          people in the room
        </p>

        <button
          class="primary-btn"
          data-action="joinParty"
          data-name="${escapeHTML(room.name)}"
          type="button">

          Join Party Room

        </button>

      </div>

    </div>

  `).join("");

}


/* =========================================================
   CAMERA
========================================================= */

let cameraStream =
  null;


async function startCameraPreview(
  videoId = "setupCamera",
  messageId = "cameraMessage"
) {

  const video =
    document.getElementById(
      videoId
    );

  const message =
    document.getElementById(
      messageId
    );


  if (!video) return;


  try {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

    }


    cameraStream =
      await navigator.mediaDevices.getUserMedia({

        video: true,

        audio: true

      });


    video.srcObject =
      cameraStream;


    if (message) {

      message.style.display =
        "none";

    }


  } catch (error) {

    console.error(error);


    if (message) {

      message.style.display =
        "flex";

      message.innerHTML =
        "Camera permission was not granted.<br><br>" +
        "Tap Open Camera and allow camera access.";

    }

  }

}


async function openCameraAgain() {

  if (
    document.getElementById(
      "partyCamera"
    )
  ) {

    await startCameraPreview(
      "partyCamera",
      "partyCameraMessage"
    );

  } else {

    await startCameraPreview();

  }


  toast(
    "Camera started"
  );

}


function stopCamera() {

  if (!cameraStream)
    return;


  cameraStream
    .getTracks()
    .forEach(
      track =>
        track.stop()
    );


  cameraStream =
    null;

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
      Camera and cover photo are required.
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
        data-action="camera"
        type="button">

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

          <option>
            Chat
          </option>

          <option>
            Music
          </option>

          <option>
            Entertainment
          </option>

          <option>
            Gaming
          </option>

          <option>
            Lifestyle
          </option>

        </select>

      </div>


      <button
        class="primary-btn"
        data-action="startSolo"
        type="button">

        🔴 Start Live

      </button>

    </div>


    <button
      class="secondary-btn"
      data-action="live"
      type="button">

      ← Back

    </button>

  `;


  setupCoverInput();

  startCameraPreview();

}


/* =========================================================
   COVER INPUT
========================================================= */

function setupCoverInput() {

  const input =
    document.getElementById(
      "coverInput"
    );


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
   START SOLO LIVE
========================================================= */

async function startSoloLive() {

  const title =
    document
      .getElementById("liveTitle")
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

  if (!supabaseClient) {
    toast("Supabase is not connected.");
    console.error("supabaseClient is null.");
    return;
  }

  const roomName =
    "eman-live-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 8);

  const hostName =
    state.profile?.username ||
    state.profile?.display_name ||
    "Eman Host";

  try {

    toast("Starting your live...");

    /*
     * Create the live room in Supabase
     */

    const { data, error } =
      await supabaseClient
        .from("live_rooms")
        .insert({

          host_name: hostName,

          title: title,

          is_live: true,

          host_id:
            state.user?.id ||
            null,

          room_name: roomName,

          cover_photo:
            state.currentCover,

          live_type: "live",

          status: "live",

          viewer_count: 0

        })
        .select()
        .single();


    if (error) {

      console.error(
        "Supabase live room error:",
        error
      );

      toast(
        "Could not create live room: " +
        error.message
      );

      return;
    }


    /*
     * Save current live room
     */

    state.currentStream = {

      id: data.id,

      type: "solo",

      title: title,

      cover: state.currentCover,

      roomName: roomName,

      hostName: hostName,

      viewers: 0,

      hearts: 0,

      startedAt: Date.now()

    };


    saveState();


    /*
     * Open live screen
     */

    renderOwnStream();


  } catch (error) {

    console.error(
      "START LIVE ERROR:",
      error
    );

    toast(
      "Unable to start live: " +
      (error.message || error)
    );

  }

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
        data-action="camera"
        type="button">

        📷 Open Camera

      </button>

    </div>

    <div class="form-card">

      <div class="form-group">

        <label>
          Party Room Cover *
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
          Room Name *
        </label>

        <input
          id="partyName"
          class="input"
          placeholder="Enter party room name">

      </div>

      <button
        class="primary-btn"
        data-action="startParty"
        type="button">

        👥 Start Party Room

      </button>

    </div>

    <button
      class="secondary-btn"
      data-action="live"
      type="button">

      ← Back

    </button>

  `;

  const input =
    document.getElementById(
      "partyCoverInput"
    );

  if (input) {

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
              "partyCoverPreview"
            );

          if (preview) {

            preview.innerHTML = `
              <img
                src="${reader.result}"
                alt="Party cover">
            `;

          }

        };

        reader.readAsDataURL(file);

      }
    );

  }

  startCameraPreview(
    "partyCamera",
    "partyCameraMessage"
  );

}

/* =========================================================
   PARTY ROOM PAGE
========================================================= */

function renderParty() {

  screen.innerHTML = `

    <h1 class="page-title">
      Party Room
    </h1>

    <p class="page-subtitle">
      Join a live multi-video party room.
    </p>

    <div class="section">

      <h2 style="margin-bottom:12px;">
        Online Party Rooms
      </h2>

      <div id="partyRoomsList">
        ${partyRoomCards()}
      </div>

    </div>

    <div class="form-card">

      <h2>
        👥 Start Your Own Party Room
      </h2>

      <p style="color:#aaa;">
        Create a room and invite other users to join.
      </p>

      <button
        class="primary-btn"
        data-action="partySetup"
        type="button">

        👥 Start Party Room

      </button>

    </div>

  `;

}

/* =========================================================
   START PARTY
========================================================= */

function startPartyLive() {

  const name =
    document
      .getElementById(
        "partyName"
      )
      ?.value
      .trim();

  if (!name) {

    toast(
      "Please enter a party room name."
    );

    return;

  }

  if (!state.currentCover) {

    toast(
      "Please select a party room cover photo."
    );

    return;

  }

  state.currentStream = {

    type: "party",

    title: name,

    cover:
      state.currentCover,

    startedAt:
      Date.now(),

    viewers: 0,

    hearts: 0,

    participants: []

  };

  saveState();

  renderOwnStream();

}


/* =========================================================
   OWN LIVE STREAM
========================================================= */

function renderOwnStream() {

  const stream = state.currentStream;

  if (!stream) {
    go("live");
    return;
  }

  // Stop any previous camera stream
  stopCamera();

  screen.innerHTML = `

    <div class="live-screen">

      <div class="live-video">

        <video
          id="liveCamera"
          autoplay
          muted
          playsinline
          style="width:100%;height:100%;object-fit:cover;">
        </video>

        <div
          id="liveCameraMessage"
          class="camera-message">
          Starting camera...
        </div>

        <div class="live-overlay">

          <div class="live-top">

            <span class="live-badge">
              🔴 LIVE
            </span>

            <span>
              ${Number(stream.viewers || 0)} viewers
            </span>

          </div>

          <div class="live-bottom">

            <h2>
              ${escapeHTML(stream.title)}
            </h2>

            <div class="live-actions">

              <button
                class="secondary-btn"
                data-action="heart"
                type="button">
                ❤️ ${Number(stream.hearts || 0)}
              </button>

              <button
                class="secondary-btn"
                data-action="sendGift"
                type="button">
                🎁 Gifts
              </button>

              <button
                class="danger-btn"
                data-action="endLive"
                type="button">
                End Live
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  `;

  // Start the live camera after the screen has been created
  setTimeout(() => {
    startCameraPreview(
      "liveCamera",
      "liveCameraMessage"
    );
  }, 100);

         }

/* =========================================================
   END LIVE
========================================================= */

function endLive() {

  stopCamera();

  state.currentStream =
    null;

  saveState();

  toast(
    "Live ended."
  );

  go("home");

}


/* =========================================================
   SIMPLE HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   BUTTON HANDLER
========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) return;

    const action =
      button.dataset.action;

    switch (action) {

      case "home":
        go("home");
        break;

      case "live":
        go("live");
        break;

      case "chat":
        go("chat");
        break;

      case "me":
        go("me");
        break;

      case "party":
        go("party");
        break;

      case "moments":
        go("moments");
        break;

      case "soloSetup":
        go("setup");
        break;

      case "partySetup":
        go("partySetup");
        break;

      case "camera":
        openCameraAgain();
        break;

      case "startSolo":
        startSoloLive();
        break;

      case "startParty":
        startPartyLive();
        break;

      case "endLive":
        endLive();
        break;

      case "heart":

        if (state.currentStream) {

          state.currentStream.hearts =
            Number(
              state.currentStream.hearts || 0
            ) + 1;

          saveState();

          renderOwnStream();

        }

        break;

      case "wallet":
        state.page = "me";
        renderWallet();
        break;

      case "profile":
        state.page = "me";
        renderProfile();
        break;

      case "income":
        state.page = "me";
        renderIncome();
        break;

      case "levels":
        state.page = "me";
        renderLevels();
        break;

      case "agency":
        state.page = "me";
        renderAgency();
        break;

      case "walletBuy":
        state.walletTab = "buy";
        renderWallet();
        break;

      case "walletHistory":
        state.walletTab = "history";
        renderWallet();
        break;

      case "recharge":

        recharge(
          Number(button.dataset.coins),
          Number(button.dataset.price)
        );

        break;

      case "submitTx":
        submitTransactionHash();
        break;

      case "copyAddress":
        copyPaymentAddress();
        break;

      case "withdraw":
        withdraw();
        break;

      case "sendGift":
        renderGifts();
        break;

      case "gift":
        sendGift(
          button.dataset.name
        );
        break;

      case "saveProfile":
        saveProfile();
        break;

      case "saveAgency":
        saveAgency();
        break;

    }

  }
);

/* =========================================================
   ME PAGE
========================================================= */

function renderMe() {

  screen.innerHTML = `

    <div class="page-container">

      <h1 class="page-title">
        Me
      </h1>

      <p class="page-subtitle">
        Manage your Eman Live account
      </p>

      <!-- PROFILE -->
      <div class="form-card">

        <div style="
          display:flex;
          align-items:center;
          gap:15px;
          margin-bottom:20px;
        ">

          <div style="
            width:65px;
            height:65px;
            border-radius:50%;
            background:#333;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:32px;
          ">
            👤
          </div>

          <div>
            <h2 style="margin:0;">
              My Profile
            </h2>

            <p style="
              margin:5px 0 0;
              color:#aaa;
            ">
              View and edit your profile
            </p>
          </div>

        </div>

        <button
          class="primary-btn"
          data-action="profile"
          type="button">
          👤 Profile
        </button>

      </div>


      <!-- WALLET -->
      <div class="form-card">

        <h2>💰 My Wallet</h2>

        <p style="color:#aaa;">
          Manage your coins and wallet
        </p>

        <button
          class="primary-btn"
          data-action="wallet"
          type="button">
          💰 Open Wallet
        </button>

      </div>


      <!-- INCOME -->
      <div class="form-card">

        <h2>💵 My Income</h2>

        <p style="color:#aaa;">
          View your earnings from Eman Live
        </p>

        <button
          class="primary-btn"
          data-action="income"
          type="button">
          💵 View Income
        </button>

      </div>


      <!-- LEVELS -->
      <div class="form-card">

        <h2>⭐ My Levels</h2>

        <p style="color:#aaa;">
          View your Eman Live level and progress
        </p>

        <button
          class="primary-btn"
          data-action="levels"
          type="button">
          ⭐ View Levels
        </button>

      </div>


      <!-- AGENCY -->
      <div class="form-card">

        <h2>🏢 Agency</h2>

        <p style="color:#aaa;">
          Manage your agency information
        </p>

        <button
          class="primary-btn"
          data-action="agency"
          type="button">
          🏢 Agency
        </button>

      </div>

    </div>

  `;

}


/* =========================================================
   PROFILE PAGE
========================================================= */

function renderProfile() {

  screen.innerHTML = `

    <div class="page-container">

      <h1 class="page-title">
        My Profile
      </h1>

      <p class="page-subtitle">
        Update your Eman Live profile
      </p>

      <div class="form-card">

        <div class="form-group">

          <label>Display Name</label>

          <input
            id="profileName"
            class="input"
            type="text"
            placeholder="Enter your name"
          >

        </div>


        <div class="form-group">

          <label>Bio</label>

          <textarea
            id="profileBio"
            class="input"
            rows="4"
            placeholder="Tell people about yourself"
          ></textarea>

        </div>


        <button
          class="primary-btn"
          data-action="saveProfile"
          type="button">
          💾 Save Profile
        </button>

      </div>


      <button
        class="secondary-btn"
        data-action="me"
        type="button">
        ← Back to Me
      </button>

    </div>

  `;

}

/* =========================================================
   STARTUP
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeEmanLive
  );

} else {

  initializeEmanLive();

}


async function initializeEmanLive() {

  try {

    console.log(
      "Eman Live starting..."
    );

    render();

    updateHeaderCoins();

    if (
      typeof initializeSupabaseUser ===
      "function"
    ) {

      await initializeSupabaseUser();

    }

    console.log(
      "Eman Live loaded successfully."
    );

  } catch (error) {

    console.error(
      "Eman Live startup error:",
      error
    );

    if (screen) {

      screen.innerHTML = `

        <div style="
          padding:40px 20px;
          text-align:center;
          color:white;
        ">

          <h2>
            Eman Live
          </h2>

          <p>
            The app encountered an error while loading.
          </p>

          <p style="
            color:#aaa;
            font-size:13px;
            word-break:break-word;
          ">
            ${escapeHTML(
              error.message || error
            )}
          </p>

        </div>

      `;

    }

  }

}
