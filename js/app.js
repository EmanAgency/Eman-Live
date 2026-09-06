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

  closeModal("profileModal");

  closeModal("inboxModal");

}


/* =========================================================
   MODALS
========================================================= */

function openLive() {

  const modal =
    document.getElementById("liveModal");

  if (!modal) {

    alert(
      "Live window could not be found."
    );

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

    alert(
      "Party Room could not be found."
    );

    return;
  }

  modal.classList.add("open");

  console.log(
    "Party Room opened."
  );

}


function openGifts() {

  const modal =
    document.getElementById("giftModal");

  if (!modal) {

    alert(
      "Wallet could not be found."
    );

    return;
  }

  modal.classList.add("open");

  updateCoinDisplay();

  console.log(
    "Wallet opened."
  );

}


function openInbox() {

  const modal =
    document.getElementById("inboxModal");

  if (!modal) {

    alert(
      "Inbox could not be found."
    );

    return;
  }

  modal.classList.add("open");

}


function openProfile() {

  const modal =
    document.getElementById("profileModal");

  if (!modal) {

    alert(
      "Profile could not be found."
    );

    return;
  }

  modal.classList.add("open");

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

  try {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      cameraStream = null;

    }

    await goLive();

  } catch (error) {

    console.error(
      "Start Live error:",
      error
    );

  }

}


async function goLive() {

  try {

    if (!window.LivekitClient) {

      throw new Error(
        "LiveKit is not loaded."
      );

    }


    console.log(
      "Starting Eman Live..."
    );


    currentRoomName =
      "eman-live-main";


    /* Create/update Supabase room */

    await createLiveRoom();


    /* Realtime */

    subscribeToLive();


    /* Get LiveKit credentials */

    const credentials =
      await getLiveKitToken(
        currentRoomName
      );


    if (
      !credentials ||
      !credentials.serverUrl ||
      !credentials.participantToken
    ) {

      throw new Error(
        "LiveKit credentials were not received."
      );

    }


    console.log(
      "LiveKit server:",
      credentials.serverUrl
    );


    /* Create LiveKit room */

    room =
      new LivekitClient.Room({

        adaptiveStream: true,

        dynacast: true

      });


    /* Participant connected */

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


    /* Participant disconnected */

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


    /* Track subscribed */

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

          const grid =
            document.getElementById(
              "videoGrid"
            );

          if (grid) {

            grid.appendChild(
              element
            );

          }

        }

      }

    );


    /* =====================================================
       CONNECT TO LIVEKIT
    ===================================================== */

    await room.connect(

      credentials.serverUrl,

      credentials.participantToken

    );


    console.log(
      "Connected to LiveKit."
    );


    /* Publish camera */

    await room.localParticipant
      .setCameraEnabled(true);


    /* Publish microphone */

    await room.localParticipant
      .setMicrophoneEnabled(true);


    /* Get local tracks */

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


    /* Open fullscreen live */

    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );


    if (fullscreen) {

      fullscreen.classList.add(
        "open"
      );

    }


    /* Attach local camera */

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


    /* Hide Go Live button */

    const goLiveButton =
      document.querySelector(
        ".fullscreenGoLive"
      );

    if (goLiveButton) {

      goLiveButton.style.display =
        "none";

    }


    /* Close setup modal */

    closeModal(
      "liveModal"
    );


    document.body.style.overflow =
      "hidden";


    /* Reset viewer count */

    viewerCount = 0;

    updateViewerCount();


    addSystemMessage(
      "🔴 You are now LIVE!"
    );


    console.log(
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
   LIVEKIT TOKEN
========================================================= */

async function getLiveKitToken(
  roomName
) {

  try {

    console.log(
      "Getting LiveKit credentials..."
    );

    console.log(
      "Room:",
      roomName
    );


    /*
      Use LiveKit's official
      development token server.
    */

    if (
      LivekitClient.TokenSource &&
      LivekitClient.TokenSource
        .developmentTokenServer
    ) {

      const tokenSource =
        LivekitClient.TokenSource
          .developmentTokenServer(
            TOKEN_SERVER_ID
          );


      const result =
        await tokenSource.fetch({

          roomName:
            roomName,

          participantName:
            "EmanUser-" +
            Date.now()

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


    /*
      Fallback for older LiveKit
      browser SDK versions.
    */

    const response =
      await fetch(
        "https://cloud-api.livekit.io/api/sandbox/connection-details",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "X-Sandbox-ID":
              TOKEN_SERVER_ID

          },

          body:
            JSON.stringify({

              room_name:
                roomName,

              participant_name:
                "EmanUser-" +
                Date.now()

            })

        }
      );


    if (!response.ok) {

      const text =
        await response.text();

      console.error(
        "Token server response:",
        text
      );

      throw new Error(
        "Token server returned " +
        response.status
      );

    }


    const data =
      await response.json();


    const serverUrl =
      data.serverUrl ||
      data.server_url;

    const participantToken =
      data.participantToken ||
      data.participant_token;


    if (
      !serverUrl ||
      !participantToken
    ) {

      throw new Error(
        "LiveKit token was not returned."
      );

    }


    return {

      serverUrl:
        serverUrl,

      participantToken:
        participantToken

    };


  } catch (error) {

    console.error(
      "LiveKit token error:",
      error
    );

    throw new Error(
      "Could not obtain LiveKit token: " +
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

            is_live:
              true,

            viewer_count:
              0

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

            event:
              "INSERT",

            schema:
              "public",

            table:
              "live_messages",

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


    const credentials =
      await getLiveKitToken(
        currentRoomName
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

        console.log(
          "Viewer received track from:",
          participant.identity
        );


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

            element.muted =
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


    await viewerRoom.connect(

      credentials.serverUrl,

      credentials.participantToken

    );


    console.log(
      "Viewer connected to LiveKit."
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
   LIVE CHAT
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

      input.value =
        "";

      return;

    }


    const {
      error
    } =
      await supabaseClient
        .from(
          "live_messages"
        )
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


    input.value =
      "";


  } catch (error) {

    console.error(
      "Send chat error:",
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


  input.value =
    "";


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

  const chat =
    document.getElementById(
      "fullChatMessages"
    );


  if (!chat) {

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


  chat.appendChild(
    div
  );


  chat.scrollTop =
    chat.scrollHeight;

}


/* =========================================================
   SYSTEM MESSAGE
========================================================= */

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
  userName
) {

  const container =
    document.getElementById(
      "joinNotifications"
    );


  if (!container) {

    return;

  }


  const notification =
    document.createElement(
      "div"
    );


  notification.className =
    "joinNotification";


  notification.textContent =
    "👋 " +
    userName +
    " joined the live";


  container.appendChild(
    notification
  );


  setTimeout(
    function () {

      notification.remove();

    },
    4000
  );

}


/* =========================================================
   VIEWER COUNT
========================================================= */

function updateViewerCount() {

  const display =
    document.getElementById(
      "viewerCount"
    );


  if (display) {

    display.textContent =
      viewerCount;

  }

}


/* =========================================================
   COINS / WALLET
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
   LIVE CAMERA CONTROLS
========================================================= */

async function toggleLiveMute() {

  if (!room) {

    return;

  }


  const enabled =
    room.localParticipant
      .isMicrophoneEnabled;


  await room.localParticipant
    .setMicrophoneEnabled(
      !enabled
    );


  const button =
    document.getElementById(
      "liveMuteButton"
    );


  if (button) {

    button.textContent =
      !enabled
        ? "🎤"
        : "🔇";

  }

}


async function toggleLiveCamera() {

  if (!room) {

    return;

  }


  const enabled =
    room.localParticipant
      .isCameraEnabled;


  await room.localParticipant
    .setCameraEnabled(
      !enabled
    );


  const button =
    document.getElementById(
      "liveCameraButton"
    );


  if (button) {

    button.textContent =
      !enabled
        ? "📹"
        : "🚫";

  }

}


/* =========================================================
   FLIP CAMERA
========================================================= */

async function flipLiveCamera() {

  try {

    facingMode =
      facingMode === "user"
        ? "environment"
        : "user";


    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      cameraStream =
        null;

    }


    if (room) {

      await room.localParticipant
        .setCameraEnabled(
          false
        );

    }


    const newStream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {
            facingMode:
              facingMode
          },

          audio: false

        });


    cameraStream =
      newStream;


    const videoTrack =
      newStream.getVideoTracks()[0];


    if (room && videoTrack) {

      const localTrack =
        new LivekitClient
          .LocalVideoTrack(
            videoTrack
          );


      await room.localParticipant
        .publishTrack(
          localTrack
        );


      localVideoTrack =
        localTrack;


      const video =
        document.getElementById(
          "fullLiveVideo"
        );


      if (video) {

        localTrack.attach(
          video
        );

      }

    }


    const preview =
      document.getElementById(
        "previewVideo"
      );


    if (preview) {

      preview.srcObject =
        newStream;

    }


  } catch (error) {

    console.error(
      "Flip camera error:",
      error
    );

    alert(
      "Could not flip camera."
    );

  }

}


/* =========================================================
   PARTY CONTROLS
========================================================= */

/* =========================================================
   PARTY LIVE ROOM - 4 SEATS
========================================================= */

let partyRoom = null;
let partyLocalVideoTrack = null;
let partyLocalAudioTrack = null;
let partySeatNumber = null;
let partyJoined = false;


/* =========================================================
   OPEN PARTY
========================================================= */

function openParty() {

  const modal = document.getElementById("partyModal");

  if (!modal) {
    alert("Party Room could not be found.");
    return;
  }

  modal.classList.add("open");

}


/* =========================================================
   CREATE VIDEO ELEMENT
========================================================= */

function createPartyVideo(track) {

  const video = document.createElement("video");

  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  track.attach(video);

  return video;

}


/* =========================================================
   FIND EMPTY SEAT
========================================================= */

function findEmptyPartySeat() {

  for (let i = 1; i <= 4; i++) {

    const seat =
      document.getElementById("partySeat" + i);

    if (
      seat &&
      !seat.classList.contains("occupied")
    ) {

      return i;

    }

  }

  return null;

}


/* =========================================================
   JOIN PARTY SEAT
========================================================= */

async function joinPartySeat() {

  try {

    if (!window.LivekitClient) {

      alert("LiveKit is not loaded.");

      return;

    }


    if (partyJoined) {

      alert("You are already in a Party seat.");

      return;

    }


    const seat = findEmptyPartySeat();


    if (!seat) {

      alert("All 4 Party seats are occupied.");

      return;

    }


    partySeatNumber = seat;


    /* Get LiveKit credentials */

    const credentials =
      await getLiveKitToken(
        "eman-party-main"
      );


    if (
      !credentials ||
      !credentials.serverUrl ||
      !credentials.participantToken
    ) {

      throw new Error(
        "Could not obtain Party LiveKit credentials."
      );

    }


    /* Create Room */

    partyRoom =
      new LivekitClient.Room({

        adaptiveStream: true,

        dynacast: true

      });


    /* =====================================================
       REMOTE VIDEO
    ===================================================== */

    partyRoom.on(

      LivekitClient.RoomEvent.TrackSubscribed,

      (
        track,
        publication,
        participant
      ) => {

        console.log(
          "Party video received:",
          participant.identity
        );


        if (
          track.kind !==
          LivekitClient.Track.Kind.Video
        ) {

          return;

        }


        const remoteSeat =
          findEmptyPartySeat();


        if (!remoteSeat) {

          console.log(
            "No empty Party seat."
          );

          return;

        }


        const seatElement =
          document.getElementById(
            "partySeat" + remoteSeat
          );


        if (!seatElement) {

          return;

        }


        const videoContainer =
          seatElement.querySelector(
            ".seatVideo"
          );


        if (!videoContainer) {

          return;

        }


        videoContainer.innerHTML = "";


        const video =
          createPartyVideo(track);


        videoContainer.appendChild(
          video
        );


        seatElement.classList.add(
          "occupied"
        );


        const name =
          seatElement.querySelector(
            ".seatName"
          );


        if (name) {

          name.textContent =
            participant.identity;

        }


        console.log(
          "Remote participant placed in Seat " +
          remoteSeat
        );

      }

    );


    /* =====================================================
       REMOTE PARTICIPANT LEFT
    ===================================================== */

    partyRoom.on(

      LivekitClient.RoomEvent.ParticipantDisconnected,

      participant => {

        console.log(
          "Party participant left:",
          participant.identity
        );


        removePartyParticipant(
          participant.identity
        );

      }

    );


    /* =====================================================
       CONNECT
    ===================================================== */

    await partyRoom.connect(

      credentials.serverUrl,

      credentials.participantToken

    );


    console.log(
      "Connected to Party Live."
    );


    /* =====================================================
       CAMERA
    ===================================================== */

    await partyRoom.localParticipant
      .setCameraEnabled(true);


    /* =====================================================
       MICROPHONE
    ===================================================== */

    await partyRoom.localParticipant
      .setMicrophoneEnabled(true);


    /* =====================================================
       GET LOCAL TRACK
    ===================================================== */

    partyRoom
      .localParticipant
      .trackPublications
      .forEach(publication => {

        if (
          publication.kind ===
          LivekitClient.Track.Kind.Video
        ) {

          partyLocalVideoTrack =
            publication.track;

        }


        if (
          publication.kind ===
          LivekitClient.Track.Kind.Audio
        ) {

          partyLocalAudioTrack =
            publication.track;

        }

      });


    /* =====================================================
       SHOW LOCAL VIDEO
    ===================================================== */

    const localSeat =
      document.getElementById(
        "partySeat" + partySeatNumber
      );


    if (
      localSeat &&
      partyLocalVideoTrack
    ) {

      const videoContainer =
        localSeat.querySelector(
          ".seatVideo"
        );


      if (videoContainer) {

        videoContainer.innerHTML = "";


        const video =
          createPartyVideo(
            partyLocalVideoTrack
          );


        videoContainer.appendChild(
          video
        );

      }


      localSeat.classList.add(
        "occupied"
      );


      const name =
        localSeat.querySelector(
          ".seatName"
        );


      if (name) {

        name.textContent = "You";

      }

    }


    partyJoined = true;


    /* Update Join button */

    const buttons =
      document.querySelectorAll(
        ".partyControls button"
      );


    if (buttons[0]) {

      buttons[0].textContent =
        "✅ Seat " +
        partySeatNumber;

    }


    /* Update status */

    const status =
      document.getElementById(
        "partyStatusText"
      );


    if (status) {

      status.textContent =
        "YOU ARE LIVE";

    }


    alert(
      "🎉 You joined Party Seat " +
      partySeatNumber +
      "!"
    );


  } catch (error) {

    console.error(
      "Party Live error:",
      error
    );


    alert(
      "Party Live error: " +
      (
        error.message ||
        error
      )
    );

  }

}


/* =========================================================
   REMOVE PARTICIPANT
========================================================= */

function removePartyParticipant(identity) {

  for (let i = 1; i <= 4; i++) {

    const seat =
      document.getElementById(
        "partySeat" + i
      );


    if (!seat) {
      continue;
    }


    const name =
      seat.querySelector(
        ".seatName"
      );


    if (
      name &&
      name.textContent === identity
    ) {

      seat.classList.remove(
        "occupied"
      );


      const video =
        seat.querySelector(
          ".seatVideo"
        );


      if (video) {

        video.innerHTML =
          '<div class="seatIcon">👤</div>';

      }


      name.textContent =
        "Seat " + i;


      break;

    }

  }

}


/* =========================================================
   PARTY MUTE
========================================================= */

async function togglePartyMute() {

  if (!partyRoom) {

    alert(
      "Join a Party seat first."
    );

    return;

  }


  const enabled =
    partyRoom.localParticipant
      .isMicrophoneEnabled;


  await partyRoom.localParticipant
    .setMicrophoneEnabled(
      !enabled
    );


  const buttons =
    document.querySelectorAll(
      ".partyControls button"
    );


  if (buttons[1]) {

    buttons[1].textContent =
      !enabled
        ? "🎤 Mute"
        : "🔇 Unmute";

  }

}


/* =========================================================
   PARTY CAMERA
========================================================= */

async function togglePartyCamera() {

  if (!partyRoom) {

    alert(
      "Join a Party seat first."
    );

    return;

  }


  const enabled =
    partyRoom.localParticipant
      .isCameraEnabled;


  await partyRoom.localParticipant
    .setCameraEnabled(
      !enabled
    );


  const buttons =
    document.querySelectorAll(
      ".partyControls button"
    );


  if (buttons[2]) {

    buttons[2].textContent =
      !enabled
        ? "📹 Camera"
        : "🚫 Camera";

  }

}


/* =========================================================
   LEAVE PARTY SEAT
========================================================= */

async function leavePartySeat() {

  try {

    if (partyRoom) {

      partyRoom.disconnect();

      partyRoom = null;

    }


    if (partySeatNumber) {

      const seat =
        document.getElementById(
          "partySeat" +
          partySeatNumber
        );


      if (seat) {

        seat.classList.remove(
          "occupied"
        );


        const video =
          seat.querySelector(
            ".seatVideo"
          );


        if (video) {

          video.innerHTML =
            '<div class="seatIcon">👤</div>';

        }


        const name =
          seat.querySelector(
            ".seatName"
          );


        if (name) {

          name.textContent =
            "Seat " +
            partySeatNumber;

        }

      }

    }


    partySeatNumber = null;

    partyJoined = false;

    partyLocalVideoTrack = null;

    partyLocalAudioTrack = null;


    const status =
      document.getElementById(
        "partyStatusText"
      );


    if (status) {

      status.textContent =
        "PARTY LIVE";

    }


    const buttons =
      document.querySelectorAll(
        ".partyControls button"
      );


    if (buttons[0]) {

      buttons[0].textContent =
        "🎥 Join Seat";

    }


    if (buttons[1]) {

      buttons[1].textContent =
        "🎤 Mute";

    }


    if (buttons[2]) {

      buttons[2].textContent =
        "📹 Camera";

    }


  } catch (error) {

    console.error(
      "Leave Party error:",
      error
    );

  }

}

    


    
    

/* =========================================================
   STOP LIVE
========================================================= */

async function stopLive() {

  try {

    console.log(
      "Stopping live..."
    );


    /* Stop LiveKit */

    if (room) {

      room.disconnect();

      room =
        null;

    }


    /* Stop camera */

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      cameraStream =
        null;

    }


    localVideoTrack =
      null;

    localAudioTrack =
      null;


    /* Update database */

    if (currentRoomName) {

      await supabaseClient
        .from("live_rooms")
        .update({

          is_live:
            false,

          viewer_count:
            0

        })
        .eq(
          "room_name",
          currentRoomName
        );

    }


    /* Remove realtime channel */

    if (realtimeChannel) {

      await supabaseClient
        .removeChannel(
          realtimeChannel
        );

      realtimeChannel =
        null;

    }


    viewerCount =
      0;

    updateViewerCount();


    /* Close fullscreen */

    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );


    if (fullscreen) {

      fullscreen.classList.remove(
        "open"
      );

    }


    /* Show Go Live button again */

    const goLiveButton =
      document.querySelector(
        ".fullscreenGoLive"
      );


    if (goLiveButton) {

      goLiveButton.style.display =
        "block";

    }


    document.body.style.overflow =
      "";


    loadLiveRooms();


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
   CLOSE FULLSCREEN
========================================================= */

function closeFullscreenLive() {

  stopLive();

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
