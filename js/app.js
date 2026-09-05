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

const TOKEN_SERVER_ID =
  "emanlive-2j2epi";


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
   STARTUP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log("Eman Live loaded.");

    updateCoinDisplay();

    loadLiveRooms();

  }
);


/* =========================================================
   BASIC NAVIGATION
========================================================= */

function goHome() {

  closeModal("liveModal");

  closeModal("partyModal");

  closeModal("giftModal");

}


/* =========================================================
   MODALS
========================================================= */

function openLive() {

  const modal =
    document.getElementById("liveModal");

  if (!modal) {
    alert("Live window could not be found.");
    return;
  }

  modal.classList.add("open");

  startCamera();

}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.classList.remove("open");
  }

}


function openParty() {

  const modal =
    document.getElementById("partyModal");

  if (!modal) {
    alert("Party Room could not be found.");
    return;
  }

  modal.classList.add("open");

  console.log("Party Room opened.");

}


function openGifts() {

  const modal =
    document.getElementById("giftModal");

  if (!modal) {
    alert("Wallet could not be found.");
    return;
  }

  modal.classList.add("open");

  updateCoinDisplay();

  console.log("Wallet opened.");

}


function openProfile() {

  alert(
    "👤 Profile feature is coming soon."
  );

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
          track => track.stop()
        );

    }


    cameraStream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: facingMode
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

      preview.muted = true;

      preview.autoplay = true;

      preview.playsInline = true;

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
      (
        error.message ||
        error
      )
    );

  }

}


/* =========================================================
   GO LIVE
========================================================= */

async function startLiveFromFullscreen() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(
        track => track.stop()
      );

    cameraStream = null;

  }

  await goLive();

}


async function goLive() {

  try {

    if (
      !window.LivekitClient
    ) {

      alert(
        "LiveKit is not loaded."
      );

      return;

    }


    console.log(
      "Starting Eman Live..."
    );


    currentRoomName =
      "eman-live-main";


    /*
      Create/update live room
    */

    await createLiveRoom();


    /*
      Realtime
    */

    subscribeToLive();


    /*
      Get LiveKit token
    */

    const token =
      await getLiveKitToken(
        currentRoomName
      );


    if (!token) {

      throw new Error(
        "LiveKit token was not received."
      );

    }


    /*
      Create LiveKit room
    */

    room =
      new LivekitClient.Room({

        adaptiveStream: true,

        dynacast: true

      });


    /*
      Local participant joined
    */

    room.on(
      LivekitClient.RoomEvent.ParticipantConnected,
      participant => {

        console.log(
          "Participant joined:",
          participant.identity
        );

        viewerCount++;

        updateViewerCount();

        addSystemMessage(
          participant.identity +
          " joined the live."
        );

      }
    );


    /*
      Participant left
    */

    room.on(
      LivekitClient.RoomEvent.ParticipantDisconnected,
      participant => {

        console.log(
          "Participant left:",
          participant.identity
        );

        if (viewerCount > 0) {
          viewerCount--;
        }

        updateViewerCount();

        addSystemMessage(
          participant.identity +
          " left the live."
        );

      }
    );


    /*
      Track subscribed
    */

    room.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (
        track,
        publication,
        participant
      ) => {

        console.log(
          "Track subscribed:",
          participant.identity
        );

        const element =
          track.attach();

        if (
          track.kind ===
          LivekitClient.Track.Kind.Video
        ) {

          element.style.width =
            "100%";

          element.style.height =
            "100%";

          element.style.objectFit =
            "cover";

          element.autoplay =
            true;

          element.playsInline =
            true;

          element.muted =
            true;

          document
            .getElementById(
              "videoGrid"
            )
            ?.appendChild(
              element
            );

        }

      }
    );


    /*
      Connect
    */

    const wsUrl =
      "wss://" +
      TOKEN_SERVER_ID +
      ".livekit.cloud";


    await room.connect(
      wsUrl,
      token
    );


    console.log(
      "Connected to LiveKit."
    );


    /*
      Publish camera
    */

    await room.localParticipant
      .setCameraEnabled(true);


    /*
      Publish microphone
    */

    await room.localParticipant
      .setMicrophoneEnabled(true);


    /*
      Get local tracks
    */

    room
      .localParticipant
      .trackPublications
      .forEach(
        publication => {

          if (
            publication.kind ===
            LivekitClient.Track.Kind.Video
          ) {

            localVideoTrack =
              publication.track;

          }

          if (
            publication.kind ===
            LivekitClient.Track.Kind.Audio
          ) {

            localAudioTrack =
              publication.track;

          }

        }
      );


    /*
      Fullscreen
    */

    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );


    if (fullscreen) {

      fullscreen.classList.add(
        "open"
      );

    }


    /*
      Attach local camera
    */

    if (localVideoTrack) {

      const video =
        document.getElementById(
          "fullLiveVideo"
        );

      if (video) {

        localVideoTrack.attach(
          video
        );

        video.autoplay =
          true;

        video.playsInline =
          true;

        video.muted =
          true;

      }

    }


    /*
      Hide Go Live button
    */

    const goLiveButton =
      document.querySelector(
        ".fullscreenGoLive"
      );


    if (goLiveButton) {

      goLiveButton.style.display =
        "none";

    }


    /*
      Close setup modal
    */

    closeModal(
      "liveModal"
    );


    document.body.style.overflow =
      "hidden";


    /*
      Mark live
    */

    addSystemMessage(
      "🔴 You are now LIVE!"
    );


    alert(
      "🔴 EMAN LIVE is now LIVE!"
    );


  } catch (error) {

    console.error(
      "LiveKit error:",
      error
    );

    alert(
      "LiveKit error: " +
      (
        error.message ||
        error
      )
    );

  }

}


/* =========================================================
   CREATE LIVE ROOM
========================================================= */

async function createLiveRoom() {

  try {

    /*
      First check whether room exists
    */

    const {
      data,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .select("*")
        .eq(
          "room_name",
          currentRoomName
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Live room lookup error:",
        error
      );

      /*
        Don't stop LiveKit if
        database permissions are
        temporarily unavailable.
      */

      return;

    }


    if (data) {

      const {
        error:
        updateError
      } =
        await supabaseClient
          .from("live_rooms")
          .update({

            is_live: true,

            viewer_count: 0

          })
          .eq(
            "room_name",
            currentRoomName
          );


      if (updateError) {

        console.error(
          "Room update error:",
          updateError
        );

      }


    } else {

      const {
        error:
        insertError
      } =
        await supabaseClient
          .from("live_rooms")
          .insert({

            room_name:
              currentRoomName,

            host_name:
              "Eman Live Host",

            is_live:
              true,

            viewer_count:
              0

          });


      if (insertError) {

        console.error(
          "Room insert error:",
          insertError
        );

      }

    }


  } catch (error) {

    console.error(
      "Create live room error:",
      error
    );

  }

}


/* =========================================================
   LIVEKIT TOKEN
========================================================= */

async function getLiveKitToken(
  roomName
) {

  /*
    This uses the development
    LiveKit token endpoint.
  */

  const url =
    "https://cloud-api.livekit.io/api/sandbox/connection-details";


  const response =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          room_name:
            roomName

        })

      }
    );


  if (!response.ok) {

    throw new Error(
      "Could not obtain LiveKit token."
    );

  }


  const data =
    await response.json();


  return (
    data.participant_token ||
    data.token ||
    data.participantToken
  );

}


/* =========================================================
   REALTIME
========================================================= */

function subscribeToLive() {

  try {

    if (realtimeChannel) {

      supabaseClient
        .removeChannel(
          realtimeChannel
        );

    }


    realtimeChannel =
      supabaseClient
        .channel(
          "eman-live-" +
          currentRoomName
        )


        .on(

          "postgres_changes",

          {
            event: "INSERT",

            schema: "public",

            table: "live_messages",

            filter:
              "room_name=eq." +
              currentRoomName

          },

          payload => {

            console.log(
              "New live message:",
              payload.new
            );


            const message =
              payload.new;


            if (
              message.event_type ===
              "message"
            ) {

              addChatMessage(
                message.user_name ||
                "User",

                message.message ||
                ""
              );

            }


            if (
              message.event_type ===
              "join"
            ) {

              addJoinNotification(
                message.user_name ||
                "Someone"
              );

            }

          }

        )


        .subscribe(

          status => {

            console.log(
              "Realtime status:",
              status
            );

          }

        );

  } catch (error) {

    console.error(
      "Realtime error:",
      error
    );

  }

}


/* =========================================================
   WATCH LIVE
========================================================= */

async function watchLive() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .select("*")
        .eq(
          "is_live",
          true
        )
        .limit(1)
        .maybeSingle();


    if (error) {

      throw error;

    }


    if (!data) {

      alert(
        "There are no live streams right now."
      );

      return;

    }


    currentRoomName =
      data.room_name;


    const token =
      await getLiveKitToken(
        currentRoomName
      );


    viewerRoom =
      new LivekitClient.Room({

        adaptiveStream: true,

        dynacast: true

      });


    viewerRoom.on(

      LivekitClient.RoomEvent.TrackSubscribed,

      (
        track,
        publication,
        participant
      ) => {

        const element =
          track.attach();


        if (
          track.kind ===
          LivekitClient.Track.Kind.Video
        ) {

          const video =
            document.getElementById(
              "fullLiveVideo"
            );


          if (video) {

            video.srcObject =
              null;

            video.replaceWith(
              element
            );

            element.id =
              "fullLiveVideo";

            element.autoplay =
              true;

            element.playsInline =
              true;

            element.style.position =
              "absolute";

            element.style.inset =
              "0";

            element.style.width =
              "100%";

            element.style.height =
              "100%";

            element.style.objectFit =
              "cover";

          }

        }

      }

    );


    const wsUrl =
      "wss://" +
      TOKEN_SERVER_ID +
      ".livekit.cloud";


    await viewerRoom.connect(
      wsUrl,
      token
    );


    await registerViewer();


    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );


    if (fullscreen) {

      fullscreen.classList.add(
        "open"
      );

    }


    document.body.style.overflow =
      "hidden";


    alert(
      "👀 You joined the live!"
    );


  } catch (error) {

    console.error(
      "Watch live error:",
      error
    );

    alert(
      "Could not join live: " +
      (
        error.message ||
        error
      )
    );

  }

}


/* =========================================================
   REGISTER VIEWER
========================================================= */

async function registerViewer() {

  try {

    if (!currentRoomName) {
      return;
    }


    await supabaseClient
      .from(
        "live_participants"
      )
      .insert({

        room_name:
          currentRoomName,

        user_name:
          "Viewer",

        role:
          "viewer"

      });


    await supabaseClient
      .from(
        "live_messages"
      )
      .insert({

        room_name:
          currentRoomName,

        user_name:
          "Viewer",

        message:
          "joined the live",

        event_type:
          "join"

      });


  } catch (error) {

    console.error(
      "Register viewer error:",
      error
    );

  }

}


/* =========================================================
   CHAT
========================================================= */

async function sendLiveChat() {

  const input =
    document.getElementById(
      "liveChatInput"
    );


  if (!input) {
    return;
  }


  const message =
    input.value.trim();


  if (!message) {
    return;
  }


  try {

    if (!currentRoomName) {

      addChatMessage(
        "You",
        message
      );

      input.value = "";

      return;

    }


    const {
      error
    } =
      await supabaseClient
        .from("live_messages")
        .insert({

          room_name:
            currentRoomName,

          user_name:
            "You",

          message:
            message,

          event_type:
            "message"

        });


    if (error) {

      console.error(
        "Chat error:",
        error
      );

      addChatMessage(
        "You",
        message
      );

    }


    input.value = "";


  } catch (error) {

    console.error(
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


  if (!input || !messages) {
    return;
  }


  const message =
    input.value.trim();


  if (!message) {
    return;
  }


  const p =
    document.createElement(
      "p"
    );


  p.textContent =
    "You: " +
    message;


  messages.appendChild(
    p
  );


  input.value = "";


  messages.scrollTop =
    messages.scrollHeight;

}


/* =========================================================
   CHAT DISPLAY
========================================================= */

function addChatMessage(
  user,
  message
) {

  const normalChat =
    document.getElementById(
      "fullChatMessages"
    );


  if (!normalChat) {
    return;
  }


  const div =
    document.createElement(
      "div"
    );


  div.className =
    "fullChatMessage";


  div.textContent =
    user +
    ": " +
    message;


  normalChat.appendChild(
    div
  );


  normalChat.scrollTop =
    normalChat.scrollHeight;

}


function addSystemMessage(
  message
) {

  addChatMessage(
    "SYSTEM",
    message
  );

}


/* =========================================================
   JOIN NOTIFICATION
========================================================= */

function addJoinNotification(
  username
) {

  const container =
    document.getElementById(
      "joinNotifications"
    );


  if (!container) {
    return;
  }


  const div =
    document.createElement(
      "div"
    );


  div.className =
    "joinNotice";


  div.textContent =
    "👋 " +
    username +
    " joined";


  container.appendChild(
    div
  );


  setTimeout(
    () => {

      div.remove();

    },
    5000
  );

}


/* =========================================================
   VIEWER COUNT
========================================================= */

function updateViewerCount() {

  const element =
    document.getElementById(
      "viewerCount"
    );


  if (element) {

    element.textContent =
      viewerCount;

  }

}


/* =========================================================
   MICROPHONE
========================================================= */

function toggleLiveMute() {

  if (!localAudioTrack) {

    alert(
      "Microphone is not available."
    );

    return;

  }


  const enabled =
    localAudioTrack.isEnabled;


  localAudioTrack.enable(
    !enabled
  );


  const button =
    document.getElementById(
      "liveMuteButton"
    );


  if (button) {

    button.textContent =
      enabled
        ? "🔇"
        : "🎤";

  }

}


/* =========================================================
   CAMERA
========================================================= */

function toggleLiveCamera() {

  if (!localVideoTrack) {

    alert(
      "Camera is not available."
    );

    return;

  }


  const enabled =
    localVideoTrack.isEnabled;


  localVideoTrack.enable(
    !enabled
  );


  const button =
    document.getElementById(
      "liveCameraButton"
    );


  if (button) {

    button.textContent =
      enabled
        ? "🚫"
        : "📹";

  }

}


/* =========================================================
   FLIP CAMERA
========================================================= */

async function flipLiveCamera() {

  facingMode =
    facingMode === "user"
      ? "environment"
      : "user";


  try {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      cameraStream = null;

    }


    if (room) {

      await room
        .localParticipant
        .setCameraEnabled(
          false
        );

    }


    await startCamera();


    if (room) {

      await room
        .localParticipant
        .setCameraEnabled(
          true
        );


      room
        .localParticipant
        .trackPublications
        .forEach(
          publication => {

            if (
              publication.kind ===
              LivekitClient.Track.Kind.Video
            ) {

              localVideoTrack =
                publication.track;

            }

          }
        );

    }


  } catch (error) {

    console.error(
      "Flip camera error:",
      error
    );


    alert(
      "Could not flip camera: " +
      (
        error.message ||
        error
      )
    );

  }

}


/* =========================================================
   PARTY CAMERA / MIC
========================================================= */

function togglePartyMute() {

  if (!localAudioTrack) {

    alert(
      "Party microphone is not connected yet."
    );

    return;

  }


  const enabled =
    localAudioTrack.isEnabled;


  localAudioTrack.enable(
    !enabled
  );

}


function togglePartyCamera() {

  if (!localVideoTrack) {

    alert(
      "Party camera is not connected yet."
    );

    return;

  }


  const enabled =
    localVideoTrack.isEnabled;


  localVideoTrack.enable(
    !enabled
  );

}


/* =========================================================
   STOP LIVE
========================================================= */

async function stopLive() {

  try {

    if (room) {

      room.disconnect();

      room = null;

    }


    if (viewerRoom) {

      viewerRoom.disconnect();

      viewerRoom = null;

    }


    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      cameraStream = null;

    }


    localVideoTrack =
      null;

    localAudioTrack =
      null;


    if (realtimeChannel) {

      await supabaseClient
        .removeChannel(
          realtimeChannel
        );

      realtimeChannel =
        null;

    }


    /*
      Mark room offline
    */

    if (currentRoomName) {

      await supabaseClient
        .from("live_rooms")
        .update({

          is_live: false,

          viewer_count: 0

        })
        .eq(
          "room_name",
          currentRoomName
        )
        .catch(
          () => {}
        );

    }


    closeFullscreenLive();

    closeModal(
      "liveModal"
    );


    const video =
      document.getElementById(
        "fullLiveVideo"
      );


    if (video) {

      video.srcObject =
        null;

    }


    const preview =
      document.getElementById(
        "previewVideo"
      );


    if (preview) {

      preview.srcObject =
        null;

    }


    const goLiveButton =
      document.querySelector(
        ".fullscreenGoLive"
      );


    if (goLiveButton) {

      goLiveButton.style.display =
        "";

    }


    document.body.style.overflow =
      "";


    viewerCount =
      0;


    updateViewerCount();


    currentRoomName =
      null;


    alert(
      "🔴 Eman Live has ended."
    );


  } catch (error) {

    console.error(
      "Stop Live error:",
      error
    );

  }

}


/* =========================================================
   FULLSCREEN
========================================================= */

function openFullscreenLive() {

  const screen =
    document.getElementById(
      "liveFullscreen"
    );


  if (!screen) {
    return;
  }


  screen.classList.add(
    "open"
  );


  document.body.style.overflow =
    "hidden";

}


function closeFullscreenLive() {

  const screen =
    document.getElementById(
      "liveFullscreen"
    );


  if (screen) {

    screen.classList.remove(
      "open"
    );

  }


  document.body.style.overflow =
    "";

}


/* =========================================================
   WALLET
========================================================= */

function updateCoinDisplay() {

  const header =
    document.getElementById(
      "coinBalance"
    );


  const wallet =
    document.getElementById(
      "walletCoins"
    );


  if (header) {

    header.textContent =
      coins;

  }


  if (wallet) {

    wallet.textContent =
      coins;

  }

}


function buyCoins() {

  alert(
    "🪙 Coin purchase will be added next."
  );

}


function sendGift(
  gift,
  price
) {

  if (coins < price) {

    alert(
      "You don't have enough coins for " +
      gift +
      "."
    );

    return;

  }


  coins -= price;


  updateCoinDisplay();


  addChatMessage(
    "You",
    "sent " +
    gift +
    " (" +
    price +
    " coins)"
  );


  alert(
    gift +
    " gift sent!"
  );

}


/* =========================================================
   LIVE ROOM LIST
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
          "is_live",
          true
        );


    if (error) {

      console.error(
        "Live list error:",
        error
      );

      return;

    }


    const list =
      document.getElementById(
        "liveList"
      );


    if (!list) {
      return;
    }


    list.innerHTML =
      "";


    if (
      !data ||
      data.length === 0
    ) {

      list.innerHTML =
        '<div class="emptyLive">No live streams yet.</div>';

      return;

    }


    data.forEach(
      liveRoom => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "liveRoomButton";


        button.textContent =
          "🔴 " +
          (
            liveRoom.host_name ||
            "Eman Live"
          );


        button.onclick =
          watchLive;


        list.appendChild(
          button
        );

      }
    );


  } catch (error) {

    console.error(
      "Load live rooms error:",
      error
    );

  }

}
