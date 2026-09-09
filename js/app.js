/* =========================================================
   EMAN LIVE
   CLEAN APP VERSION
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

  appName: "Eman Live",

  livekitUrl:
    "wss://eman-live-ckbb612s.livekit.cloud",

  tokenServer:
    "https://emanlive-2j2epi.sandbox.livekit.io",

  paymentNetwork:
    "BNB Smart Chain · BEP20",

  paymentWallet:
    "0xec05bb37867f5e75a706a1face5304fd40a8f54c"

};


/* =========================================================
   STATE
========================================================= */

const savedState =
  localStorage.getItem("emanLiveState");

const state =
  savedState
    ? JSON.parse(savedState)
    : {

        user: {

          id: "ID814203",

          username: "New User",

          name: "New User",

          bio: "",

          gender: "",

          birthday: "",

          country: "",

          language: "",

          avatar: "",

          album: []

        },

        coins: 7000,

        beans: 0,

        wealthXP: 120,

        charmXP: 80,

        messages: [],

        moments: [],

        withdrawals: [],

        gifts: [],

        currentScreen: "home",

        meTab: "profile",

        walletTab: "buy"

      };


/* =========================================================
   SAVE
========================================================= */

function saveState() {

  localStorage.setItem(
    "emanLiveState",
    JSON.stringify(state)
  );

}


/* =========================================================
   HELPERS
========================================================= */

function $(selector) {

  return document.querySelector(selector);

}


function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function formatNumber(number) {

  return Number(number || 0)
    .toLocaleString();

}


function showToast(message) {

  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);

}


function dateNow() {

  return new Date()
    .toLocaleDateString();

}


/* =========================================================
   AVATARS
========================================================= */

function avatarHTML() {

  if (state.user.avatar) {

    return `
      <div class="avatar">
        <img
          src="${escapeHTML(state.user.avatar)}"
          alt="Profile"
        >
      </div>
    `;

  }

  return `
    <div class="avatar">
      👤
    </div>
  `;

}


/* =========================================================
   POPULAR HOSTS
========================================================= */

const popularHosts = [

  {
    name: "Luna",
    id: "ID100201",
    viewers: 1842,
    cover:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900"
  },

  {
    name: "Mia",
    id: "ID100338",
    viewers: 1250,
    cover:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900"
  },

  {
    name: "Sofia",
    id: "ID100441",
    viewers: 986,
    cover:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900"
  },

  {
    name: "Nina",
    id: "ID100577",
    viewers: 731,
    cover:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900"
  },

  {
    name: "Emma",
    id: "ID100689",
    viewers: 614,
    cover:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900"
  },

  {
    name: "Bella",
    id: "ID100721",
    viewers: 508,
    cover:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900"
  }

];


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(screen) {

  state.currentScreen = screen;

  saveState();

  render();

}


document.addEventListener(
  "click",
  function(event) {

    const nav =
      event.target.closest("[data-nav]");

    if (nav) {

      navigate(nav.dataset.nav);

      return;

    }


    const action =
      event.target.closest("[data-action]");

    if (action) {

      handleAction(
        action.dataset.action,
        action
      );

    }

  }
);


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

  renderScreen();

  updateNavigation();

  updateCoins();

}


/* =========================================================
   NAV ACTIVE STATE
========================================================= */

function updateNavigation() {

  document
    .querySelectorAll("[data-nav]")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.nav ===
        state.currentScreen
      );

    });

}


/* =========================================================
   COIN DISPLAY
========================================================= */

function updateCoins() {

  const mini =
    $("#coinMini");

  if (mini) {

    mini.textContent =
      formatNumber(state.coins);

  }

}


/* =========================================================
   SCREEN ROUTER
========================================================= */

function renderScreen() {

  const screen =
    $("#screen");

  if (!screen) return;


  switch (state.currentScreen) {

    case "home":

      screen.innerHTML =
        homePage();

      break;


    case "live":

      screen.innerHTML =
        livePage();

      break;


    case "chat":

      screen.innerHTML =
        chatPage();

      break;


    case "me":

      screen.innerHTML =
        mePage();

      break;


    default:

      state.currentScreen = "home";

      screen.innerHTML =
        homePage();

  }

}


/* =========================================================
   HOME / POPULAR
========================================================= */

function homePage() {

  return `

    <div class="hero">

      <h1>Popular</h1>

      <p>
        Discover the most popular hosts
        who are online right now.
      </p>

    </div>


    <div class="pill-row">

      <button class="pill active">
        Popular
      </button>

      <button class="pill">
        Following
      </button>

      <button class="pill">
        New
      </button>

    </div>


    <div class="section-title">

      <h2>
        Popular Live
      </h2>

      <span class="muted">
        ${popularHosts.length} online
      </span>

    </div>


    <div class="host-grid">

      ${popularHosts.map(host => `

        <article class="host-card">

          <div class="host-cover">

            <img
              src="${host.cover}"
              alt="${escapeHTML(host.name)}"
              loading="lazy"
            >

            <span class="online">
              ● LIVE
            </span>

            <span class="viewer">
              👁 ${formatNumber(host.viewers)}
            </span>

          </div>


          <div class="host-info">

            <div class="host-name">
              ${escapeHTML(host.name)}
            </div>

            <div class="host-id">
              ${escapeHTML(host.id)}
            </div>


            <button
              class="primary"
              data-action="watchHost"
              data-name="${escapeHTML(host.name)}"
            >
              Watch Live
            </button>

          </div>

        </article>

      `).join("")}

    </div>


    <div class="section-title">

      <h2>
        Explore
      </h2>

    </div>


    <div class="feature-list">


      <button
        class="feature"
        data-action="party"
      >

        <b>
          🎉 Party Room
        </b>

        <span>
          Join popular multi-video
          party rooms.
        </span>

      </button>


      <button
        class="feature"
        data-action="moments"
      >

        <b>
          📸 Moments
        </b>

        <span>
          See pictures and videos
          from hosts.
        </span>

      </button>


      <button
        class="feature"
        data-action="inbox"
      >

        <b>
          📥 Inbox
        </b>

        <span>
          Private messages and
          conversations.
        </span>

      </button>


      <button
        class="feature"
        data-action="me"
      >

        <b>
          👤 Me
        </b>

        <span>
          Profile, Wallet, Income,
          Level and Agency.
        </span>

      </button>


    </div>

  `;

}


/* =========================================================
   LIVE PAGE
========================================================= */

function livePage() {

  return `

    <div class="page-head">

      <h1>
        Go Live
      </h1>

    </div>


    <div class="hero">

      <h1>
        Start your live
      </h1>

      <p>
        Choose how you want to broadcast.
        Your camera will open before
        you start.
      </p>

    </div>


    <div class="live-choice">


      <button
        class="choice"
        data-action="solo"
      >

        <div class="big">
          📹
        </div>

        <h2>
          Solo Live
        </h2>

        <p>
          Go live by yourself and
          receive gifts from viewers.
        </p>

      </button>


      <button
        class="choice party"
        data-action="partySetup"
      >

        <div class="big">
          👥
        </div>

        <h2>
          Party Room
        </h2>

        <p>
          Start a multi-video room and
          invite other users.
        </p>

      </button>


    </div>

  `;

}


/* =========================================================
   CAMERA SETUP
========================================================= */

function cameraSetup(mode) {

  return `

    <div class="page-head">

      <button
        class="back"
        data-action="live"
      >
        ‹
      </button>

      <h1>
        ${
          mode === "party"
            ? "Party Room"
            : "Solo Live"
        }
      </h1>

    </div>


    <div class="camera-box">

      <video
        id="preview"
        autoplay
        muted
        playsinline
      ></video>

      <div class="camera-label">
        Camera Preview
      </div>

    </div>


    <div class="form">


      <div class="label">
        Live cover photo — required
      </div>


      <label
        class="cover-picker"
        id="coverPicker"
      >

        <span>
          📷 Tap to choose a live
          cover photo
        </span>

        <input
          id="coverInput"
          type="file"
          accept="image/*"
          hidden
        >

      </label>


      <input
        class="field"
        id="liveTitle"
        placeholder="Live title"
      >


      <select
        class="field"
        id="category"
      >

        <option>
          Chat
        </option>

        <option>
          Music
        </option>

        <option>
          Dance
        </option>

        <option>
          Beauty
        </option>

        <option>
          Gaming
        </option>

        <option>
          Party
        </option>

        <option>
          Talent
        </option>

        <option>
          Other
        </option>

      </select>


      <select
        class="field"
        id="privacy"
      >

        <option>
          Public
        </option>

        <option>
          Friends
        </option>

      </select>


      <button
        class="primary"
        data-action="startBroadcast"
        data-mode="${mode}"
      >

        Start ${
          mode === "party"
            ? "Party Room"
            : "Live"
        }

      </button>


      <button
        class="secondary"
        data-action="live"
      >

        Cancel

      </button>


    </div>

  `;

}


/* =========================================================
   OPEN CAMERA
========================================================= */

async function openCamera() {

  try {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      showToast(
        "Camera is not supported by this browser."
      );

      return;

    }


    const stream =
      await navigator.mediaDevices
        .getUserMedia({

          video: true,

          audio: true

        });


    window.emanCamera =
      stream;


    const preview =
      $("#preview");


    if (preview) {

      preview.srcObject =
        stream;

    }

  }

  catch (error) {

    console.log(error);

    showToast(
      "Please allow camera and microphone access."
    );

  }

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

  if (window.emanCamera) {

    window.emanCamera
      .getTracks()
      .forEach(track => {

        track.stop();

      });

    window.emanCamera =
      null;

  }

}


/* =========================================================
   SETUP LIVE
========================================================= */

function setupLive(mode) {

  stopCamera();

  window.liveCover = null;


  $("#screen").innerHTML =
    cameraSetup(mode);


  openCamera();


  const input =
    $("#coverInput");


  if (!input) return;


  input.addEventListener(
    "change",
    function() {

      const file =
        input.files[0];

      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        function() {

          window.liveCover =
            reader.result;


          const picker =
            $("#coverPicker");


          if (picker) {

            picker.innerHTML = `

              <img
                src="${reader.result}"
                alt="Live Cover"
              >

            `;

          }

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   PARTY ROOM PAGE
========================================================= */

function partyPage() {

  return `

    <div class="page-head">

      <h1>
        Party Room
      </h1>

    </div>


    <div class="hero">

      <h1>
        Popular Party Rooms
      </h1>

      <p>
        Join a multi-video party room
        with popular users online.
      </p>

    </div>


    <div class="host-grid">

      ${popularHosts.slice(0, 4).map(
        (host, index) => `

        <article class="host-card">

          <div class="host-cover">

            <img
              src="${host.cover}"
              alt="${escapeHTML(host.name)}"
            >

            <span class="online">
              ● LIVE
            </span>

            <span class="viewer">
              👁 ${formatNumber(host.viewers)}
            </span>

          </div>


          <div class="host-info">

            <div class="host-name">

              Room ${index + 1}

              ·

              ${escapeHTML(host.name)}

            </div>


            <div class="host-id">

              ${
                index === 0
                  ? "4 seats available"
                  : "3 seats available"
              }

            </div>


            <button
              class="primary"
              data-action="joinParty"
              data-name="${escapeHTML(host.name)}"
            >

              Join Room

            </button>

          </div>

        </article>

      `).join("")}

    </div>

  `;

}


/* =========================================================
   MOMENTS
========================================================= */

function momentsPage() {

  const demoMoments =
    state.moments.length
      ? state.moments
      : popularHosts.map(host => ({

          name: host.name,

          img: host.cover,

          text:
            "Having a great time on Eman Live! 💕"

        }));


  return `

    <div class="page-head">

      <h1>
        Moments
      </h1>

    </div>


    <div class="hero">

      <h1>
        Moments
      </h1>

      <p>
        Share pictures and videos
        with your audience.
      </p>


      <button
        class="primary"
        data-action="postMoment"
      >

        ＋ Post a Moment

      </button>

    </div>


    <div class="moment-grid">

      ${demoMoments.map(moment => `

        <article class="moment">

          <img
            src="${escapeHTML(moment.img)}"
            loading="lazy"
            alt="Moment"
          >

          <div class="body">

            <b>
              ${escapeHTML(moment.name)}
            </b>

            <p class="muted">

              ${escapeHTML(moment.text)}

            </p>

          </div>

        </article>

      `).join("")}

    </div>

  `;

}


/* =========================================================
   CHAT / INBOX
========================================================= */

function chatPage() {

  return `

    <div class="page-head">

      <h1>
        Inbox
      </h1>

    </div>


    <div class="chat-list">

      ${
        state.messages.length

        ?

        state.messages.map(message => `

          <div class="chat-item">

            <div class="avatar-sm">
              👤
            </div>

            <div>

              <b>
                ${escapeHTML(message.from)}
              </b>

              <div class="muted">

                ${escapeHTML(message.text)}

              </div>

            </div>

          </div>

        `).join("")

        :

        `

          <div class="empty">

            No private messages yet.

            <br><br>

            Messages from hosts and
            friends will appear here.

          </div>

        `
      }

    </div>


    <div class="message-box">

      <input
        id="messageInput"
        class="field"
        placeholder="Write a private message"
      >


      <button
        class="primary"
        style="width:auto;margin:0"
        data-action="sendMessage"
      >

        Send

      </button>

    </div>

  `;

}


/* =========================================================
   ME PAGE
========================================================= */

function mePage() {

  const tab =
    state.meTab || "profile";


  return `

    <div class="page-head">

      <h1>
        Me
      </h1>

    </div>


    <div class="profile-head">

      ${avatarHTML()}


      <div>

        <h2 style="margin:0">

          ${escapeHTML(
            state.user.username
          )}

        </h2>


        <div class="muted">

          ${escapeHTML(
            state.user.id
          )}

        </div>

      </div>

    </div>


    <div class="tabs">


      <button
        class="${tab === "profile" ? "active" : ""}"
        data-action="meTab"
        data-tab="profile"
      >

        Profile

      </button>


      <button
        class="${tab === "wallet" ? "active" : ""}"
        data-action="meTab"
        data-tab="wallet"
      >

        Wallet

      </button>


      <button
        class="${tab === "income" ? "active" : ""}"
        data-action="meTab"
        data-tab="income"
      >

        Income

      </button>


      <button
        class="${tab === "level" ? "active" : ""}"
        data-action="meTab"
        data-tab="level"
      >

        Level

      </button>


      <button
        class="${tab === "agency" ? "active" : ""}"
        data-action="meTab"
        data-tab="agency"
      >

        Agency

      </button>


    </div>


    ${
      tab === "profile"
        ? profileTab()

        : tab === "wallet"
        ? walletTab
