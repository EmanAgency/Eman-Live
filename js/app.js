/* =========================================================
   EMAN LIVE
   COMPLETE APP.JS
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://kzuaaihvehqhipwmrzal.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LsGL8Os9cgqLmItWgk0ADg_nBWuLs7I";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   LIVEKIT
========================================================= */

const TOKEN_SERVER_ID = "emanlive-2j2epi";

/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentRoomName = null;

let room = null;

let viewerRoom = null;

let localVideoTrack = null;

let localAudioTrack = null;

let cameraStream = null;

let realtimeChannel = null;

let facingMode = "user";

let viewerCount = 0;

let coins = 0;


/* =========================================================
   LIVE COVER
========================================================= */

let liveCoverFile = null;

let liveCoverUrl = null;


/* =========================================================
   PARTY VARIABLES
========================================================= */

let partyRoom = null;

let partyLocalVideoTrack = null;

let partyLocalAudioTrack = null;

let partySeatNumber = null;

let partyJoined = false;


/* =========================================================
   AUTH VARIABLES
========================================================= */

let authMode = "login";


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "Eman Live loaded."
    );

    updateCoinDisplay();

    loadLiveRooms();

    setupLiveCoverSelector();

    checkExistingLogin();

  }
);


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

async function checkExistingLogin() {

  try {

    const {
      data: { user }
    } =
      await supabaseClient.auth.getUser();

    if (user) {

      console.log(
        "Logged in user:",
        user.email
      );

    } else {

      console.log(
        "No user logged in."
      );

    }

  } catch (error) {

    console.error(
      "Login check error:",
      error
    );

  }

}


/* =========================================================
   BASIC NAVIGATION
========================================================= */

function goHome() {

  closeModal("liveModal");

  closeModal("partyModal");

  closeModal("giftModal");

  closeModal("profileModal");

  closeModal("inboxModal");

  closeModal("authModal");

  closeModal("liveFullscreen");

}


/* =========================================================
   MODALS
========================================================= */

function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {

    modal.classList.remove("open");

  }

}


/* =========================================================
   AUTHENTICATION
========================================================= */

function openAuth(mode = "login") {

  authMode = mode;

  const modal =
    document.getElementById(
      "authModal"
    );

  if (!modal) {

    alert(
      "Login window could not be found."
    );

    return;

  }

  updateAuthUI();

  modal.classList.add("open");

}


function switchAuthMode() {

  authMode =
    authMode === "login"
      ? "signup"
      : "login";

  updateAuthUI();

}


function updateAuthUI() {

  const title =
    document.getElementById(
      "authTitle"
    );

  const subtitle =
    document.getElementById(
      "authSubtitle"
    );

  const button =
    document.getElementById(
      "authMainButton"
    );

  const switchButton =
    document.getElementById(
      "authSwitchButton"
    );

  const confirmPassword =
    document.getElementById(
      "authConfirmPassword"
    );

  const message =
    document.getElementById(
      "authMessage"
    );

  if (!title) return;


  if (message) {

    message.textContent = "";

  }


  if (authMode === "login") {

    title.textContent =
      "Welcome Back";

    subtitle.textContent =
      "Login to your Eman Live account";

    button.textContent =
      "🔐 LOGIN";

    switchButton.textContent =
      "Don't have an account? Sign Up";

    if (confirmPassword) {

      confirmPassword.style.display =
        "none";

    }

  } else {

    title.textContent =
      "Create Your Eman Live Account";

    subtitle.textContent =
      "Join Eman Live today";

    button.textContent =
      "✨ CREATE ACCOUNT";

    switchButton.textContent =
      "Already have an account? Login";

    if (confirmPassword) {

      confirmPassword.style.display =
        "block";

    }

  }

}


async function handleAuth() {

  const emailInput =
    document.getElementById(
      "authEmail"
    );

  const passwordInput =
    document.getElementById(
      "authPassword"
    );

  const confirmInput =
    document.getElementById(
      "authConfirmPassword"
    );

  const message =
    document.getElementById(
      "authMessage"
    );

  if (!emailInput ||
      !passwordInput) {

    return;

  }


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


  if (!email) {

    message.textContent =
      "Please enter your email.";

    return;

  }


  if (!password) {

    message.textContent =
      "Please enter your password.";

    return;

  }


  /* =========================
     SIGN UP
  ========================= */

  if (authMode === "signup") {

    const confirmPassword =
      confirmInput
        ? confirmInput.value
        : "";


    if (password.length < 6) {

      message.textContent =
        "Password must be at least 6 characters.";

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      message.textContent =
        "Passwords do not match.";

      return;

    }


    message.textContent =
      "Creating your account...";


    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.signUp({
          email: email,
          password: password
        });


      if (error) {

        throw error;

      }


      if (
        data &&
        data.user
      ) {

        try {

          await supabaseClient
            .from("profiles")
            .upsert({
              id: data.user.id,
              username:
                email
                  .split("@")[0]
            });

        } catch (
          profileError
        ) {

          console.warn(
            "Profile creation warning:",
            profileError
          );

        }

      }


      message.textContent =
        "✅ Account created successfully!";


      setTimeout(
        function () {

          closeModal(
            "authModal"
          );

        },
        1000
      );


    } catch (error) {

      console.error(
        "Sign up error:",
        error
      );

      message.textContent =
        error.message ||
        "Could not create account.";

    }

    return;

  }


  /* =========================
     LOGIN
  ========================= */

  message.textContent =
    "Logging in...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({
          email: email,
          password: password
        });


    if (error) {

      throw error;

    }


    console.log(
      "Logged in:",
      data.user
    );


    message.textContent =
      "✅ Login successful!";


    setTimeout(
      function () {

        closeModal(
          "authModal"
        );

      },
      700
    );


  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    message.textContent =
      error.message ||
      "Login failed.";

  }

}


/* =========================================================
   CURRENT USER
========================================================= */

async function getCurrentUser() {

  const {
    data: { user }
  } =
    await supabaseClient.auth.getUser();

  return user;

}


async function requireLogin() {

  const user =
    await getCurrentUser();

  if (user) {

    return true;

  }

  openAuth("login");

  return false;

}


/* =========================================================
   LIVE COVER SELECTOR
========================================================= */

function setupLiveCoverSelector() {

  const input =
    document.getElementById(
      "liveCoverInput"
    );

  const preview =
    document.getElementById(
      "liveCoverPreview"
    );

  const startButton =
    document.getElementById(
      "startLiveButton"
    );

  const message =
    document.getElementById(
      "liveSetupMessage"
    );


  if (!input) {

    return;

  }


  input.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];

      if (!file) {

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select an image file."
        );

        input.value = "";

        return;

      }


      if (
        file.size >
        10 * 1024 * 1024
      ) {

        alert(
          "Live cover must be 10 MB or smaller."
        );

        input.value = "";

        return;

      }


      liveCoverFile =
        file;


      if (liveCoverUrl) {

        URL.revokeObjectURL(
          liveCoverUrl
        );

      }


      liveCoverUrl =
        URL.createObjectURL(
          file
        );


      if (preview) {

        preview.src =
          liveCoverUrl;

        preview.style.display =
          "block";

      }


      if (startButton) {

        startButton.disabled =
          false;

      }


      if (message) {

        message.textContent =
          "✅ Live cover selected. You can now start your live.";

      }

    }
  );

}


/* =========================================================
   OPEN LIVE
========================================================= */

async function openLive() {

  const loggedIn =
    await requireLogin();

  if (!loggedIn) {

    return;

  }


  const modal =
    document.getElementById(
      "liveModal"
    );

  if (!modal) {

    alert(
      "Live window could not be found."
    );

    return;

  }


  modal.classList.add("open");

  startCamera();

}


/* =========================================================
   CAMERA
========================================================= */

async function startCamera() {

  try {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      alert(
        "Your browser does not support camera access."
      );

      return;

    }


    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

    }


    cameraStream =
      await navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode:
              facingMode
          },
          audio: true
        });


    const preview =
      document.getElementById(
        "previewVideo"
      );


    if (preview) {

      preview.srcObject =
        cameraStream;

      preview.muted =
        true;

      preview.autoplay =
        true;

      preview.playsInline =
        true;

      await preview
        .play()
        .catch(
          () => {}
        );

    }


    console.log(
      "Camera and microphone ready."
    );


  } catch (error) {

    console.error(
      "Camera error:",
      error
    );

    alert(
      "Camera could not start: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   GO LIVE
========================================================= */

async function startLiveFromFullscreen() {

  try {

    /* COVER */

    if (!liveCoverFile) {

      alert(
        "📸 Please upload a live cover photo first."
      );

      return;

    }


    /* TITLE */

    const titleInput =
      document.getElementById(
        "liveTitleInput"
      );

    const liveTitle =
      titleInput
        ? titleInput.value.trim()
        : "";


    if (!liveTitle) {

      alert(
        "Please enter a live title."
      );

      if (titleInput) {

        titleInput.focus();

      }

      return;

    }


    /* LOGIN */

    const user =
      await getCurrentUser();


    if (!user) {

      openAuth("login");

      return;

    }


    /* FILE NAME */

    const fileExtension =
      liveCoverFile.name
        .split(".")
        .pop()
        .toLowerCase();


    const fileName =
      user.id +
      "_" +
      Date.now() +
      "." +
      fileExtension;


    const filePath =
      user.id +
      "/" +
      fileName;


    /* UPLOAD COVER */

    console.log(
      "Uploading live cover..."
    );


    const uploadResult =
      await supabaseClient.storage
        .from("live-covers")
        .upload(
          filePath,
          liveCoverFile,
          {
            cacheControl:
              "3600",
            upsert:
              false
          }
        );


    if (uploadResult.error) {

      throw uploadResult.error;

    }


    /* COVER URL */

    const {
      data: publicUrlData
    } =
      supabaseClient.storage
        .from("live-covers")
        .getPublicUrl(
          filePath
        );


    const coverUrl =
      publicUrlData.publicUrl;


    /* ROOM NAME */

    const roomName =
      "eman-live-" +
      Date.now();


    /* CREATE LIVE ROOM */

    const {
      error: roomError
    } =
      await supabaseClient
        .from("live_rooms")
        .insert({
          host_id:
            user.id,
          room_name:
            roomName,
          title:
            liveTitle,
          cover_photo:
            coverUrl,
          live_type:
            "live",
          status:
            "live",
          viewer_count:
            0
        });


    if (roomError) {

      throw roomError;

    }


    currentRoomName =
      roomName;


    /* CONNECT */

    await goLive(
      roomName
    );


  } catch (error) {

    console.error(
      "Start Live error:",
      error
    );


    alert(
      "Start Live error: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   CONNECT LIVEKIT
========================================================= */

async function goLive(roomName) {

  try {

    const credentials =
      await getLiveKitToken(
        roomName
      );


    if (
      !credentials ||
      !credentials.serverUrl ||
      !credentials.participantToken
    ) {

      throw new Error(
        "LiveKit credentials are missing."
      );

    }


    room =
      new LivekitClient.Room({
        adaptiveStream:
          true,
        dynacast:
          true
      });


    await room.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    console.log(
      "Connected to LiveKit."
    );


    await room.localParticipant
      .setCameraEnabled(
        true
      );


    await room.localParticipant
      .setMicrophoneEnabled(
        true
      );


    /* LOCAL VIDEO */

    room.localParticipant
      .videoTrackPublications
      .forEach(
        publication => {

          if (
            !publication.track
          ) {

            return;

          }


          localVideoTrack =
            publication.track;


          attachLocalLiveVideo(
            localVideoTrack
          );

        }
      );


    /* LOCAL AUDIO */

    room.localParticipant
      .audioTrackPublications
      .forEach(
        publication => {

          if (
            publication.track
          ) {

            localAudioTrack =
              publication.track;

          }

        }
      );


    /* FULLSCREEN */

    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );


    if (fullscreen) {

      fullscreen.classList.add(
        "open"
      );

    }


    closeModal(
      "liveModal"
    );


    /* RESET COVER */

    liveCoverFile =
      null;


    const coverInput =
      document.getElementById(
        "liveCoverInput"
      );


    if (coverInput) {

      coverInput.value =
        "";

    }


    const coverPreview =
      document.getElementById(
        "liveCoverPreview"
      );


    if (coverPreview) {

      coverPreview.src =
        "";

      coverPreview.style.display =
        "none";

    }


    /* RESET TITLE */

    const titleInput =
      document.getElementById(
        "liveTitleInput"
      );


    if (titleInput) {

      titleInput.value =
        "";

    }


    viewerCount =
      0;


    updateViewerCount(
      0
    );


    console.log(
      "🎥 EMAN LIVE IS NOW LIVE!"
    );


  } catch (error) {

    console.error(
      "LiveKit connection error:",
      error
    );


    try {

      if (room) {

        room.disconnect();

      }

    } catch (
      disconnectError
    ) {

      console.error(
        disconnectError
      );

    }


    room =
      null;

    currentRoomName =
      null;


    alert(
      "LiveKit error: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   ATTACH LIVE VIDEO
========================================================= */

function attachLocalLiveVideo(
  track
) {

  if (!track) {

    return;

  }


  const container =
    document.getElementById(
      "liveFullscreenVideo"
    ) ||
    document.getElementById(
      "liveVideo"
    ) ||
    document.getElementById(
      "fullscreenVideo"
    );


  if (!container) {

    console.warn(
      "Live video container not found."
    );

    return;

  }


  container.innerHTML =
    "";


  const video =
    document.createElement(
      "video"
    );


  video.autoplay =
    true;

  video.playsInline =
    true;

  video.muted =
    true;


  track.attach(
    video
  );


  container.appendChild(
    video
  );

}


/* =========================================================
   LIVEKIT TOKEN
========================================================= */

/* =========================================================
   LIVEKIT TOKEN
========================================================= */

async function getLiveKitToken(roomName) {

  try {

    console.log("Getting LiveKit credentials...");
    console.log("Room:", roomName);

    /* USE LIVEKIT DEVELOPMENT TOKEN SERVER */

    if (
      window.LivekitClient &&
      LivekitClient.TokenSource &&
      LivekitClient.TokenSource.developmentTokenServer
    ) {

      console.log(
        "Using LiveKit development token server..."
      );

      const tokenSource =
        LivekitClient.TokenSource
          .developmentTokenServer(
            TOKEN_SERVER_ID
          );

      const result =
        await tokenSource.fetch({
          roomName: roomName,
          participantName:
            "EmanUser-" + Date.now()
        });

      console.log(
        "LiveKit credentials received."
      );

      if (
        !result ||
        !result.serverUrl ||
        !result.participantToken
      ) {

        throw new Error(
          "LiveKit returned invalid credentials."
        );

      }

      return {
        serverUrl:
          result.serverUrl,

        participantToken:
          result.participantToken
      };

    }


    throw new Error(
      "LiveKit TokenSource is not available. Please check that the LiveKit JavaScript library is loaded."
    );


  } catch (error) {

    console.error(
      "LiveKit token error:",
      error
    );

    throw new Error(
      "LiveKit connection failed: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   LOAD LIVE ROOMS
========================================================= */

async function loadLiveRooms() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .select("*")
        .eq(
          "status",
          "live"
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );


    if (error) {

      console.error(
        "Load live rooms error:",
        error
      );

      return;

    }


    const rooms =
      data || [];


    const container =
      document.getElementById(
        "rooms"
      );


    if (!container) {

      return;

    }


    if (!rooms.length) {

      container.innerHTML =
        "<p>No live streams yet.</p>";

      return;

    }


    container.innerHTML =
      rooms.map(
        roomItem => {

          const title =
            roomItem.title ||
            "Live Stream";


          const cover =
            roomItem.cover_photo ||
            "";


          const viewers =
            roomItem.viewer_count ||
            0;


          return `
            <article
              class="room"
              onclick="watchLive('${roomItem.room_name}')">

              <div class="thumb">

                ${
                  cover
                    ? `
                      <img
                        src="${cover}"
                        alt="Live Cover"
                        style="
                          width:100%;
                          height:100%;
                          object-fit:cover;
                        ">
                    `
                    : `
                      <div
                        class="avatar">
                        LIVE
                      </div>
                    `
                }

                <div class="live">
                  ● LIVE
                </div>

              </div>

              <div class="info">

                <div class="name">
                  ${escapeHtml(title)}
                </div>

                <div class="small">
                  👁 ${viewers} viewers
                </div>

              </div>

            </article>
          `;

        }
      ).join("");


  } catch (error) {

    console.error(
      "Live rooms error:",
      error
    );

  }

}


/* =========================================================
   WATCH LIVE
========================================================= */

async function watchLive(
  roomName
) {

  try {

    const loggedIn =
      await requireLogin();


    if (!loggedIn) {

      return;

    }


    const credentials =
      await getLiveKitToken(
        roomName
      );


    viewerRoom =
      new LivekitClient.Room({
        adaptiveStream:
          true,

        dynacast:
          true
      });


    viewerRoom.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (
        track,
        publication,
        participant
      ) => {

        attachRemoteTrack(
          track,
          participant
        );

      }
    );


    await viewerRoom.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    console.log(
      "Viewer connected."
    );


    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );


    if (fullscreen) {

      fullscreen.classList.add(
        "open"
      );

    }


  } catch (error) {

    console.error(
      "Watch Live error:",
      error
    );


    alert(
      "Unable to join live: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   REMOTE TRACK
========================================================= */

function attachRemoteTrack(
  track,
  participant
) {

  const container =
    document.getElementById(
      "liveFullscreenVideo"
    ) ||
    document.getElementById(
      "liveVideo"
    );


  if (!container) {

    return;

  }


  if (
    track.kind ===
    "video"
  ) {

    const video =
      document.createElement(
        "video"
      );


    video.autoplay =
      true;

    video.playsInline =
      true;

    video.dataset.participant =
      participant.identity;


    track.attach(
      video
    );


    container.appendChild(
      video
    );

  }

}


/* =========================================================
   VIEWER COUNT
========================================================= */

function updateViewerCount(
  count
) {

  viewerCount =
    count;


  const elements =
    document.querySelectorAll(
      "#viewerCount, #liveViewerCount"
    );


  elements.forEach(
    element => {

      element.textContent =
        count;

    }
  );

}


/* =========================================================
   STOP LIVE
========================================================= */

async function stopLive() {

  try {

    if (room) {

      room.disconnect();

    }


    room =
      null;


    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

      cameraStream =
        null;

    }


    if (currentRoomName) {

      await supabaseClient
        .from("live_rooms")
        .update({
          status:
            "ended",
          ended_at:
            new Date().toISOString()
        })
        .eq(
          "room_name",
          currentRoomName
        );

    }


    currentRoomName =
      null;


    closeModal(
      "liveFullscreen"
    );


    await loadLiveRooms();


    console.log(
      "Live ended."
    );


  } catch (error) {

    console.error(
      "Stop live error:",
      error
    );

  }

}


/* =========================================================
   FLIP CAMERA
========================================================= */

async function flipCamera() {

  facingMode =
    facingMode === "user"
      ? "environment"
      : "user";


  await startCamera();

}


/* =========================================================
   LIVE MUTE
========================================================= */

function toggleLiveMute() {

  if (!localAudioTrack) {

    return;

  }


  const enabled =
    localAudioTrack.enabled;


  localAudioTrack.enabled =
    !enabled;


  console.log(
    enabled
      ? "Microphone muted."
      : "Microphone unmuted."
  );

}


/* =========================================================
   LIVE CAMERA TOGGLE
========================================================= */

function toggleLiveCamera() {

  if (!localVideoTrack) {

    return;

  }


  const enabled =
    localVideoTrack.enabled;


  localVideoTrack.enabled =
    !enabled;


  console.log(
    enabled
      ? "Camera off."
      : "Camera on."
  );

}


/* =========================================================
   WALLET
========================================================= */

function openGifts() {

  const modal =
    document.getElementById(
      "giftModal"
    );


  if (!modal) {

    alert(
      "Wallet could not be found."
    );

    return;

  }


  modal.classList.add(
    "open"
  );


  updateCoinDisplay();

}


/* =========================================================
   COIN DISPLAY
========================================================= */

function updateCoinDisplay() {

  const elements =
    document.querySelectorAll(
      "#coinBalance, #walletCoins"
    );


  elements.forEach(
    element => {

      element.textContent =
        coins.toLocaleString();

    }
  );

}


/* =========================================================
   GIFT
========================================================= */

async function gift(
  name,
  cost
) {

  const loggedIn =
    await requireLogin();


  if (!loggedIn) {

    return;

  }


  if (coins < cost) {

    alert(
      "Not enough Eman Coins."
    );

    return;

  }


  coins -=
    cost;


  updateCoinDisplay();


  console.log(
    "Gift sent:",
    name,
    cost
  );


  alert(
    name +
    " sent! " +
    cost.toLocaleString() +
    " coins deducted."
  );


  closeModal(
    "giftModal"
  );

}


/* =========================================================
   INBOX
========================================================= */

function openInbox() {

  const modal =
    document.getElementById(
      "inboxModal"
    );


  if (!modal) {

    alert(
      "Inbox could not be found."
    );

    return;

  }


  modal.classList.add(
    "open"
  );

}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

  const modal =
    document.getElementById(
      "profileModal"
    );


  if (!modal) {

    alert(
      "Profile could not be found."
    );

    return;

  }


  modal.classList.add(
    "open"
  );

}


/* =========================================================
   PARTY
========================================================= */

async function openParty() {

  const loggedIn =
    await requireLogin();


  if (!loggedIn) {

    return;

  }


  const modal =
    document.getElementById(
      "partyModal"
    );


  if (!modal) {

    alert(
      "Party Room could not be found."
    );

    return;

  }


  modal.classList.add(
    "open"
  );


  console.log(
    "Party Room opened."
  );

}


/* =========================================================
   FIND EMPTY PARTY SEAT
========================================================= */

function findEmptyPartySeat() {

  for (
    let i = 1;
    i <= 4;
    i++
  ) {

    const seat =
      document.getElementById(
        "partySeat" + i
      );


    if (!seat) {

      continue;

    }


    if (
      !seat.classList.contains(
        "occupied"
      )
    ) {

      return i;

    }

  }


  return null;

}


/* =========================================================
   CREATE PARTY VIDEO
========================================================= */

function createPartyVideo(
  track
) {

  const video =
    document.createElement(
      "video"
    );


  video.autoplay =
    true;

  video.playsInline =
    true;

  video.muted =
    true;


  track.attach(
    video
  );


  return video;

}


/* =========================================================
   JOIN PARTY SEAT
========================================================= */

async function joinPartySeat() {

  try {

    const loggedIn =
      await requireLogin();


    if (!loggedIn) {

      return;

    }


    if (partyJoined) {

      return;

    }


    const seat =
      findEmptyPartySeat();


    if (!seat) {

      alert(
        "All 4 Party seats are occupied."
      );

      return;

    }


    const credentials =
      await getLiveKitToken(
        "eman-party-main"
      );


    partyRoom =
      new LivekitClient.Room({
        adaptiveStream:
          true,

        dynacast:
          true
      });


    partyRoom.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (
        track,
        publication,
        participant
      ) => {

        addRemotePartyParticipant(
          track,
          participant
        );

      }
    );


    partyRoom.on(
      LivekitClient.RoomEvent.ParticipantDisconnected,
      participant => {

        removePartyParticipant(
          participant
        );

      }
    );


    await partyRoom.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    await partyRoom.localParticipant
      .setCameraEnabled(
        true
      );


    await partyRoom.localParticipant
      .setMicrophoneEnabled(
        true
      );


    partySeatNumber =
      seat;


    partyJoined =
      true;


    markPartySeatOccupied(
      seat,
      "You"
    );


    partyRoom.localParticipant
      .videoTrackPublications
      .forEach(
        publication => {

          if (
            publication.track
          ) {

            partyLocalVideoTrack =
              publication.track;


            const seatElement =
              document.getElementById(
                "partySeat" +
                seat
              );


            if (seatElement) {

              const videoArea =
                seatElement.querySelector(
                  ".seatVideo"
                );


              if (videoArea) {

                videoArea.innerHTML =
                  "";


                videoArea.appendChild(
                  createPartyVideo(
                    publication.track
                  )
                );

              }

            }

          }

        }
      );


    partyRoom.localParticipant
      .audioTrackPublications
      .forEach(
        publication => {

          if (
            publication.track
          ) {

            partyLocalAudioTrack =
              publication.track;

          }

        }
      );


    console.log(
      "Joined Party seat:",
      seat
    );


  } catch (error) {

    console.error(
      "Party join error:",
      error
    );


    alert(
      "Party Live error: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   PARTY SEAT OCCUPIED
========================================================= */

function markPartySeatOccupied(
  seatNumber,
  name
) {

  const seat =
    document.getElementById(
      "partySeat" +
      seatNumber
    );


  if (!seat) {

    return;

  }


  seat.classList.add(
    "occupied"
  );


  const nameElement =
    seat.querySelector(
      ".seatName"
    );


  if (nameElement) {

    nameElement.textContent =
      name;

  }

}


/* =========================================================
   REMOTE PARTY PARTICIPANT
========================================================= */

function addRemotePartyParticipant(
  track,
  participant
) {

  if (
    track.kind !==
    "video"
  ) {

    return;

  }


  const seats =
    document.querySelectorAll(
      ".partySeat"
    );


  let targetSeat =
    null;


  for (
    const seat of seats
  ) {

    if (
      !seat.classList.contains(
        "occupied"
      )
    ) {

      targetSeat =
        seat;

      break;

    }

  }


  if (!targetSeat) {

    return;

  }


  const number =
    targetSeat.id
      .replace(
        "partySeat",
        ""
      );


  markPartySeatOccupied(
    number,
    participant.identity ||
      "Guest"
  );


  const videoArea =
    targetSeat.querySelector(
      ".seatVideo"
    );


  if (videoArea) {

    videoArea.innerHTML =
      "";


    videoArea.appendChild(
      createPartyVideo(
        track
      )
    );

  }

}


/* =========================================================
   REMOVE PARTY PARTICIPANT
========================================================= */

function removePartyParticipant(
  participant
) {

  const seats =
    document.querySelectorAll(
      ".partySeat"
    );


  seats.forEach(
    seat => {

      const nameElement =
        seat.querySelector(
          ".seatName"
        );


      if (
        nameElement &&
        nameElement.textContent ===
          participant.identity
      ) {

        seat.classList.remove(
          "occupied"
        );


        nameElement.textContent =
          "Seat " +
          seat.id.replace(
            "partySeat",
            ""
          );


        const videoArea =
          seat.querySelector(
            ".seatVideo"
          );


        if (videoArea) {

          videoArea.innerHTML =
            '<div class="seatIcon">👤</div>';

        }

      }

    }
  );

}


/* =========================================================
   PARTY MUTE
========================================================= */

function togglePartyMute() {

  if (!partyLocalAudioTrack) {

    return;

  }


  partyLocalAudioTrack.enabled =
    !partyLocalAudioTrack.enabled;

}


/* =========================================================
   PARTY CAMERA
========================================================= */

function togglePartyCamera() {

  if (!partyLocalVideoTrack) {

    return;

  }


  partyLocalVideoTrack.enabled =
    !partyLocalVideoTrack.enabled;

}


/* =========================================================
   LEAVE PARTY SEAT
========================================================= */

async function leavePartySeat() {

  try {

    if (
      partyRoom
    ) {

      partyRoom.disconnect();

    }


    if (
      partySeatNumber
    ) {

      const seat =
        document.getElementById(
          "partySeat" +
          partySeatNumber
        );


      if (seat) {

        seat.classList.remove(
          "occupied"
        );


        const nameElement =
          seat.querySelector(
            ".seatName"
          );


        if (nameElement) {

          nameElement.textContent =
            "Seat " +
            partySeatNumber;

        }


        const videoArea =
          seat.querySelector(
            ".seatVideo"
          );


        if (videoArea) {

          videoArea.innerHTML =
            '<div class="seatIcon">👤</div>';

        }

      }

    }


    partyRoom =
      null;

    partyLocalVideoTrack =
      null;

    partyLocalAudioTrack =
      null;

    partySeatNumber =
      null;

    partyJoined =
      false;


    console.log(
      "Left Party seat."
    );


  } catch (error) {

    console.error(
      "Leave Party error:",
      error
    );

  }

}


/* =========================================================
   PARTY CHAT
========================================================= */

function sendPartyChat() {

  const input =
    document.getElementById(
      "partyChatInput"
    );


  const messages =
    document.getElementById(
      "partyChatMessages"
    );


  if (
    !input ||
    !messages
  ) {

    return;

  }


  const text =
    input.value.trim();


  if (!text) {

    return;

  }


  const message =
    document.createElement(
      "p"
    );


  message.innerHTML =
    "<b>You:</b> " +
    escapeHtml(text);


  messages.appendChild(
    message
  );


  input.value =
    "";


  messages.scrollTop =
    messages.scrollHeight;

}


/* =========================================================
   PROFILE / INBOX HELPERS
========================================================= */

async function loadMyProfile() {

  try {

    const user =
      await getCurrentUser();


    if (!user) {

      return null;

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
          "id",
          user.id
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Profile error:",
        error
      );

      return null;

    }


    return data;

  } catch (error) {

    console.error(
      error
    );

    return null;

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  try {

    const {
      error
    } =
      await supabaseClient.auth
        .signOut();


    if (error) {

      throw error;

    }


    alert(
      "You have been logged out."
    );


    goHome();


  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    alert(
      "Logout error: " +
      (error.message || error)
    );

  }

}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

supabaseClient.auth.onAuthStateChange(
  function (
    event,
    session
  ) {

    console.log(
      "Auth event:",
      event
    );


    if (
      session &&
      session.user
    ) {

      console.log(
        "User authenticated:",
        session.user.email
      );

    }

  }
);


/* =========================================================
   END OF EMAN LIVE APP.JS
========================================================= */
