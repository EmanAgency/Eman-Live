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
   LIVEKIT
========================================================= */

const LIVEKIT_URL =
  "wss://eman-live-ckbb612s.livekit.cloud";

const LIVEKIT_TOKEN_SERVER_ID =
  "emanlive-2j2epi";

let partyRoom = null;

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
   POPULAR LIVE PAGE
========================================================= */

function renderLive() {

  screen.innerHTML = `

    <div class="popular-page">

      <!-- HEADER -->

      <div class="popular-header">

        <div>
          <h1 class="popular-title">
            Popular
          </h1>

          <p class="popular-subtitle">
            Popular live streamers
          </p>
        </div>

        <button
          class="popular-start-btn"
          data-action="soloSetup"
          type="button">

          🔴 Start Live

        </button>

      </div>


      <!-- POPULAR STREAMERS -->

      <div class="section">

        <h2 class="popular-section-title">
          🔥 Popular Live Streamers
        </h2>

        <div id="liveStreamList">

          <div class="form-card">

            <p>
              Loading popular streamers...
            </p>

          </div>

        </div>

      </div>

    </div>

  `;


  /*
   * Load real live streamers
   */

  liveRoomCards();

}


/* =========================================================
   POPULAR LIVE STREAMERS
========================================================= */

async function liveRoomCards() {

  const container =
    document.getElementById(
      "liveStreamList"
    );

  if (!container) return;


  container.innerHTML = `

    <div class="form-card">

      <p>
        Loading popular streamers...
      </p>

    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .select("*")
        .eq("is_live", true)
        .eq("status", "live")
        .eq("live_type", "live")
        .order(
          "viewer_count",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "Popular live rooms error:",
        error
      );

      container.innerHTML = `

        <div class="form-card">

          <h3>
            Unable to load live streams
          </h3>

          <p style="color:#aaa;">
            ${escapeHTML(
              error.message
            )}
          </p>

        </div>

      `;

      return;
    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `

        <div class="form-card">

          <h3>
            🔴 No one is live right now
          </h3>

          <p style="color:#aaa;">
            Start a live stream and become
            one of the first popular streamers.
          </p>

          <button
            class="primary-btn"
            data-action="soloSetup"
            type="button">

            🔴 Start Live

          </button>

        </div>

      `;

      return;
    }


    container.innerHTML =

      data.map(
        (room, index) => `

        <div
          class="popular-live-card"
          data-action="joinLive"
          data-room="${escapeHTML(
            room.room_name || ""
          )}"
          data-id="${escapeHTML(
            room.id || ""
          )}"
        >

          <div class="popular-live-cover">

            ${
              room.cover_photo
                ? `
                  <img
                    src="${room.cover_photo}"
                    alt="${escapeHTML(
                      room.title ||
                      "Live Stream"
                    )}">
                `
                : `
                  <div class="default-live-cover">
                    📱
                  </div>
                `
            }

            <span class="popular-live-badge">
              🔴 LIVE
            </span>

            <span class="popular-viewers">
              👁
              ${Number(
                room.viewer_count || 0
              ).toLocaleString()}
            </span>

          </div>


          <div class="popular-live-info">

            <div class="popular-rank">
              #${index + 1}
            </div>

            <div class="popular-live-details">

              <h3>
                ${escapeHTML(
                  room.title ||
                  "Live Stream"
                )}
              </h3>

              <p>
                👤
                ${escapeHTML(
                  room.host_name ||
                  "Eman Host"
                )}
              </p>

            </div>

            <button
              class="watch-live-btn"
              data-action="joinLive"
              data-room="${escapeHTML(
                room.room_name || ""
              )}"
              data-id="${escapeHTML(
                room.id || ""
              )}"
              type="button">

              Watch

            </button>

          </div>

        </div>

      `
      ).join("");


  } catch (error) {

    console.error(
      "POPULAR LIVE ERROR:",
      error
    );

    container.innerHTML = `

      <div class="form-card">

        <p>
          Unable to load popular streamers.
        </p>

      </div>

    `;

  }

}


/* =========================================================
   POPULAR PARTY ROOMS
========================================================= */

async function partyRoomCards() {

  const container =
    document.getElementById(
      "partyRoomsList"
    );

  if (!container) return;


  container.innerHTML = `

    <div class="form-card">

      <p>
        Loading popular party rooms...
      </p>

    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .select("*")
        .eq("is_live", true)
        .eq("status", "live")
        .eq("live_type", "party")
        .order(
          "viewer_count",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "Party rooms error:",
        error
      );

      container.innerHTML = `

        <div class="form-card">

          <h3>
            Unable to load party rooms
          </h3>

          <p style="color:#aaa;">
            ${escapeHTML(
              error.message
            )}
          </p>

        </div>

      `;

      return;
    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `

        <div class="form-card">

          <h3>
            👥 No party rooms are live
          </h3>

          <p style="color:#aaa;">
            Start a Party Room and become
            one of the first popular players.
          </p>

          <button
            class="primary-btn"
            data-action="partySetup"
            type="button">

            👥 Start Party

          </button>

        </div>

      `;

      return;
    }


    container.innerHTML =

      data.map(
        (room, index) => `

        <div class="popular-party-card">


          <!-- COVER -->

          <div class="party-cover">

            ${
              room.cover_photo
                ? `
                  <img
                    src="${room.cover_photo}"
                    alt="${escapeHTML(
                      room.title ||
                      "Party Room"
                    )}">
                `
                : `
                  <div class="default-party-cover">
                    👥
                  </div>
                `
            }

            <span class="live-badge">
              🔴 LIVE
            </span>

            <span class="viewer-badge">
              👁
              ${Number(
                room.viewer_count || 0
              ).toLocaleString()}
            </span>

          </div>


          <!-- INFORMATION -->

          <div class="party-content">

            <div class="popular-rank">
              #${index + 1}
            </div>

            <h3>
              ${escapeHTML(
                room.title ||
                "Party Room"
              )}
            </h3>

            <p>
              👤
              ${escapeHTML(
                room.host_name ||
                "Party Player"
              )}
            </p>


            <button
              class="primary-btn"
              data-action="joinParty"
              data-room="${escapeHTML(
                room.room_name || ""
              )}"
              data-id="${escapeHTML(
                room.id || ""
              )}"
              type="button">

              ▶ Join Party

            </button>

          </div>


        </div>

      `
      ).join("");


  } catch (error) {

    console.error(
      "POPULAR PARTY ERROR:",
      error
    );

    container.innerHTML = `

      <div class="form-card">

        <p>
          Unable to load popular party rooms.
        </p>

      </div>

    `;

  }

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
   SOLO LIVE SETUP — FULLSCREEN CAMERA
========================================================= */

function renderLiveSetup() {

  screen.innerHTML = `

    <div class="fullscreen-live-setup">

      <!-- FULLSCREEN CAMERA -->
      <div class="fullscreen-camera">

        <video
          id="setupCamera"
          autoplay
          muted
          playsinline>
        </video>

        <div
          id="cameraMessage"
          class="camera-message">
          Starting camera...
        </div>

        <!-- TOP BAR -->
        <div class="setup-top-bar">

          <button
            class="camera-close-btn"
            data-action="live"
            type="button">
            ✕
          </button>

          <span class="setup-title">
            Go Live
          </span>

        </div>


        <!-- SETUP CONTROLS -->
        <div class="live-setup-panel">

          <div class="live-setup-card">

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


            <label>
              Live Title *
            </label>

            <input
              id="liveTitle"
              class="input"
              type="text"
              placeholder="Enter your live title">


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


            <button
              class="primary-btn start-live-full-btn"
              data-action="startSolo"
              type="button">

              🔴 START LIVE

            </button>

          </div>

        </div>

      </div>

    </div>

  `;

  setupCoverInput();

  /*
   * Automatically open camera
   */
  startCameraPreview(
    "setupCamera",
    "cameraMessage"
  );

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
   POPULAR PARTY ROOM PAGE
========================================================= */

function renderParty() {

  screen.innerHTML = `

    <div class="popular-page">

      <!-- HEADER -->

      <div class="popular-header">

        <div>

          <h1 class="popular-title">
            Popular
          </h1>

          <p class="popular-subtitle">
            Popular party players
          </p>

        </div>


        <button
          class="popular-start-btn party-start-btn"
          data-action="partySetup"
          type="button">

          👥 Start Party

        </button>

      </div>


      <!-- POPULAR PARTY ROOMS -->

      <div class="section">

        <h2 class="popular-section-title">
          🔥 Popular Party Players
        </h2>

        <div id="partyRoomsList">

          <div class="form-card">

            <p>
              Loading popular party rooms...
            </p>

          </div>

        </div>

      </div>

    </div>

  `;


  /*
   * Load real party rooms
   */

  partyRoomCards();

}

/* =========================================================
   START PARTY ROOM
   SUPABASE + LIVEKIT
========================================================= */

async function startPartyLive() {

  const name =
    document
      .getElementById("partyName")
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

  if (!supabaseClient) {

    toast(
      "Supabase is not connected."
    );

    console.error(
      "supabaseClient is not available."
    );

    return;
  }

  if (!window.LivekitClient) {

    toast(
      "LiveKit is not loaded."
    );

    console.error(
      "LiveKit JavaScript SDK is not loaded."
    );

    return;
  }


  /*
   * Create a unique LiveKit room name
   */

  const roomName =
    "eman-party-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 8);


  /*
   * Get host name
   */

  const hostName =
    state.profile?.username ||
    state.profile?.display_name ||
    "Eman Host";


  try {

    toast(
      "Creating your party room..."
    );


    /*
     * Create party room in Supabase
     */

    const {
      data,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .insert({

          host_name:
            hostName,

          title:
            name,

          is_live:
            true,

          host_id:
            state.user?.id ||
            currentSupabaseUser?.id ||
            null,

          room_name:
            roomName,

          cover_photo:
            state.currentCover,

          live_type:
            "party",

          status:
            "live",

          viewer_count:
            0

        })
        .select()
        .single();


    /*
     * Supabase error
     */

    if (error) {

      console.error(
        "SUPABASE PARTY ROOM ERROR:",
        error
      );

      toast(
        "Could not create party room: " +
        error.message
      );

      return;
    }


    /*
     * Save party room locally
     */

    state.currentStream = {

      id:
        data.id,

      type:
        "party",

      title:
        name,

      cover:
        state.currentCover,

      roomName:
        roomName,

      hostName:
        hostName,

      startedAt:
        Date.now(),

      viewers:
        0,

      hearts:
        0,

      participants: [

        {
          seat: 1,
          type: "host",
          name: hostName
        },

        {
          seat: 2,
          type: "empty",
          name: ""
        },

        {
          seat: 3,
          type: "empty",
          name: ""
        },

        {
          seat: 4,
          type: "empty",
          name: ""
        }

      ]

    };


    saveState();


    /*
     * Open the 4-seat party room
     */

    renderPartyLive();


    /*
     * Connect to LiveKit
     */

    await connectPartyToLiveKit();


  } catch (error) {

    console.error(
      "START PARTY ERROR:",
      error
    );

    toast(
      "Unable to start party: " +
      (
        error.message ||
        error
      )
    );

  }

}


/* =========================================================
   CONNECT PARTY TO LIVEKIT
========================================================= */

async function connectPartyToLiveKit() {

  try {

    if (!window.LivekitClient) {

      throw new Error(
        "LiveKit SDK is not loaded."
      );

    }

    if (!state.currentStream?.roomName) {

      throw new Error(
        "Party room name is missing."
      );

    }

    toast(
      "Connecting to party room..."
    );

    const {
      Room,
      RoomEvent,
      TokenSource
    } = LivekitClient;


    /*
     * Development token server
     */

    const tokenSource =
      TokenSource.developmentTokenServer(
        LIVEKIT_TOKEN_SERVER_ID
      );


    /*
     * Get participant token
     */

    const credentials =
      await tokenSource.fetch({
        roomName:
          state.currentStream.roomName
      });


    /*
     * Create LiveKit room
     */

    partyRoom =
      new Room({
        adaptiveStream: true,
        dynacast: true
      });


    /*
     * Remote participant joined
     */

    partyRoom.on(
      RoomEvent.ParticipantConnected,
      participant => {

        console.log(
          "Participant joined:",
          participant.identity
        );

        updatePartySeats();

      }
    );


    /*
     * Remote participant left
     */

    partyRoom.on(
      RoomEvent.ParticipantDisconnected,
      participant => {

        console.log(
          "Participant left:",
          participant.identity
        );

        removeParticipantFromParty(
          participant
        );

        updatePartySeats();

      }
    );


    /*
     * New video/audio track
     */

    partyRoom.on(
      RoomEvent.TrackSubscribed,
      (
        track,
        publication,
        participant
      ) => {

        console.log(
          "Track subscribed:",
          participant.identity,
          track.kind
        );

        attachPartyTrack(
          track,
          participant
        );

      }
    );


    /*
     * Track removed
     */

    partyRoom.on(
      RoomEvent.TrackUnsubscribed,
      (
        track,
        publication,
        participant
      ) => {

        track.detach();

        updatePartySeats();

      }
    );


    /*
     * Connect
     */

    await partyRoom.connect(
      credentials.serverUrl ||
        LIVEKIT_URL,
      credentials.participantToken
    );


    console.log(
      "Connected to LiveKit:",
      partyRoom.name
    );


    /*
     * Turn on camera and microphone
     */

    await partyRoom
      .localParticipant
      .enableCameraAndMicrophone();


    /*
     * Display existing participants
     */

    partyRoom
      .remoteParticipants
      .forEach(
        participant => {

          updatePartySeats();

        }
      );


    /*
     * Attach our local camera
     */

    attachLocalPartyCamera();


    updatePartySeats();


    toast(
      "You are live in the party room."
    );


  } catch (error) {

    console.error(
      "LIVEKIT PARTY ERROR:",
      error
    );

    toast(
      "LiveKit error: " +
      (
        error.message ||
        error
      )
    );

  }

}

/* =========================================================
   PARTY LIVE ROOM — 4 SEATS
========================================================= */

function renderPartyLive() {

  const stream =
    state.currentStream;

  if (!stream ||
      stream.type !== "party") {

    go("party");

    return;
  }

  screen.innerHTML = `

    <div class="party-live-screen">

      <!-- TOP BAR -->

      <div class="party-live-header">

        <button
          class="party-back-btn"
          data-action="party"
          type="button">

          ✕

        </button>

        <div class="party-live-title">

          <strong>
            ${escapeHTML(stream.title)}
          </strong>

          <small>
            👥 Party Room
          </small>

        </div>

        <div class="party-viewers">

          👁
          ${Number(stream.viewers || 0)}

        </div>

      </div>


      <!-- 4 SEAT GRID -->

      <div class="party-seat-grid">


        <!-- SEAT 1 -->

        <div
          class="party-seat occupied"
          id="partySeat1">

          <video
            id="partyLocalVideo"
            autoplay
            muted
            playsinline>
          </video>

          <div class="seat-overlay">

            <span class="seat-live">
              🔴 LIVE
            </span>

            <span class="seat-name">
              You
            </span>

          </div>

        </div>


        <!-- SEAT 2 -->

        <div
          class="party-seat empty"
          id="partySeat2">

          <div class="empty-seat">

            <div class="seat-number">
              2
            </div>

            <div>
              Waiting for player
            </div>

          </div>

        </div>


        <!-- SEAT 3 -->

        <div
          class="party-seat empty"
          id="partySeat3">

          <div class="empty-seat">

            <div class="seat-number">
              3
            </div>

            <div>
              Waiting for player
            </div>

          </div>

        </div>


        <!-- SEAT 4 -->

        <div
          class="party-seat empty"
          id="partySeat4">

          <div class="empty-seat">

            <div class="seat-number">
              4
            </div>

            <div>
              Waiting for player
            </div>

          </div>

        </div>


      </div>


      <!-- BOTTOM CONTROLS -->

      <div class="party-controls">

        <button
          class="party-control-btn"
          data-action="heart"
          type="button">

          ❤️
        </button>

        <button
          class="party-control-btn"
          data-action="sendGift"
          type="button">

          🎁
        </button>

        <button
          class="party-end-btn"
          data-action="endLive"
          type="button">

          End

        </button>

      </div>

    </div>

  `;


  /*
   * Start camera automatically.
   */

  setTimeout(() => {

    startCameraPreview(
      "partyLocalVideo",
      null
    );

  }, 100);

       }

/* =========================================================
   LOCAL PARTY CAMERA
========================================================= */

function attachLocalPartyCamera() {

  if (!partyRoom) return;

  const seat =
    document.getElementById(
      "partySeat1"
    );

  if (!seat) return;

  /*
   * Remove old video
   */

  const oldVideo =
    seat.querySelector(
      "video"
    );

  if (oldVideo) {
    oldVideo.remove();
  }


  /*
   * Find local camera publication
   */

  const publication =
    partyRoom
      .localParticipant
      .getTrackPublication(
        LivekitClient.Track.Source.Camera
      );


  if (
    !publication ||
    !publication.track
  ) {

    console.log(
      "Local camera publication not ready."
    );

    return;
  }


  const video =
    publication.track.attach();

  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "cover";

  seat.prepend(video);

}

/* =========================================================
   UPDATE PARTY SEATS
========================================================= */

function updatePartySeats() {

  if (!partyRoom) return;


  const participants =
    Array.from(
      partyRoom.remoteParticipants.values()
    );


  /*
   * Only 3 guest seats.
   * Seat 1 belongs to host.
   */

  const guestParticipants =
    participants.slice(0, 3);


  for (
    let seatNumber = 2;
    seatNumber <= 4;
    seatNumber++
  ) {

    const seat =
      document.getElementById(
        "partySeat" +
        seatNumber
      );

    if (!seat) continue;


    const participant =
      guestParticipants[
        seatNumber - 2
      ];


    if (!participant) {

      showEmptyPartySeat(
        seat,
        seatNumber
      );

      continue;
    }


    showPartyParticipant(
      seat,
      participant,
      seatNumber
    );

  }

}

/* =========================================================
   SHOW EMPTY PARTY SEAT
========================================================= */

function showEmptyPartySeat(
  seat,
  seatNumber
) {

  seat.className =
    "party-seat empty";

  seat.innerHTML = `

    <div class="empty-seat">

      <div class="seat-number">
        ${seatNumber}
      </div>

      <div>
        Waiting for player
      </div>

    </div>

  `;

}

/* =========================================================
   SHOW PARTY PARTICIPANT
========================================================= */

function showPartyParticipant(
  seat,
  participant,
  seatNumber
) {

  seat.className =
    "party-seat occupied";


  let video =
    seat.querySelector(
      "video"
    );


  if (!video) {

    video =
      document.createElement(
        "video"
      );

    video.autoplay = true;
    video.playsInline = true;

    video.style.width =
      "100%";

    video.style.height =
      "100%";

    video.style.objectFit =
      "cover";

    seat.innerHTML = "";

    seat.appendChild(
      video
    );

  }


  /*
   * Find participant camera
   */

  const publication =
    participant.getTrackPublication(
      LivekitClient.Track.Source.Camera
    );


  if (
    publication &&
    publication.track
  ) {

    publication.track.attach(
      video
    );

  }


  /*
   * Participant name
   */

  const overlay =
    document.createElement(
      "div"
    );

  overlay.className =
    "seat-overlay";

  overlay.innerHTML = `

    <span class="seat-live">
      🔴 LIVE
    </span>

    <span class="seat-name">
      ${escapeHTML(
        participant.name ||
        participant.identity ||
        "Guest"
      )}
    </span>

  `;

  seat.appendChild(
    overlay
  );

}

/* =========================================================
   ATTACH REMOTE TRACK
========================================================= */

function attachPartyTrack(
  track,
  participant
) {

  if (
    track.kind !==
    "video"
  ) {

    /*
     * Audio tracks can play
     * without being visible.
     */

    const audio =
      track.attach();

    audio.autoplay = true;

    document.body.appendChild(
      audio
    );

    return;

  }


  updatePartySeats();

}

/* =========================================================
   REMOVE PARTICIPANT
========================================================= */

function removeParticipantFromParty(
  participant
) {

  if (!partyRoom) return;

  participant.tracks?.forEach(
    publication => {

      if (publication.track) {

        publication.track.detach();

      }

    }
  );

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
