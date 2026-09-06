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
/* =========================================================
   LIVE COVER PHOTO
========================================================= */

let liveCoverFile = null;
let liveCoverUrl = null;


/* =========================================================
   LIVE COVER SELECT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const input =
    document.getElementById("liveCoverInput");

  const preview =
    document.getElementById("liveCoverPreview");

  const startButton =
    document.getElementById("startLiveButton");

  const message =
    document.getElementById("liveSetupMessage");


  if (!input) {
    return;
  }


  input.addEventListener("change", event => {

    const file =
      event.target.files[0];


    if (!file) {
      return;
    }


    /* Check image */

    if (!file.type.startsWith("image/")) {

      alert(
        "Please select an image file."
      );

      input.value = "";

      return;

    }


    /* Check 10 MB */

    if (file.size > 10 * 1024 * 1024) {

      alert(
        "Live cover must be 10 MB or smaller."
      );

      input.value = "";

      return;

    }


    liveCoverFile = file;


    /* Create preview */

    liveCoverUrl =
      URL.createObjectURL(file);


    if (preview) {

      preview.src =
        liveCoverUrl;

      preview.style.display =
        "block";

    }


    /* Enable Start Live */

    if (startButton) {

      startButton.disabled =
        false;

    }


    if (message) {

      message.textContent =
        "✅ Live cover selected. You can now start your live.";

    }

  });

});
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

/* =========================================================
   GO LIVE
========================================================= */

async function startLiveFromFullscreen() {
  try {

    /* CHECK COVER */
    if (!liveCoverFile) {
      alert("📸 Please upload a live cover photo first.");
      return;
    }

    /* CHECK TITLE */
    const titleInput =
      document.getElementById("liveTitleInput");

    const liveTitle =
      titleInput ? titleInput.value.trim() : "";

    if (!liveTitle) {
      alert("Please enter a live title.");

      if (titleInput) {
        titleInput.focus();
      }

      return;
    }

    /* CHECK LOGIN */
    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
      alert("Please log in before going live.");
      return;
    }

    /* FILE EXTENSION */
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
      user.id + "/" + fileName;

    /* UPLOAD COVER */
    console.log("Uploading live cover...");

    const uploadResult =
      await supabaseClient.storage
        .from("live-covers")
        .upload(
          filePath,
          liveCoverFile,
          {
            cacheControl: "3600",
            upsert: false
          }
        );

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    /* GET COVER URL */
    const {
      data: publicUrlData
    } =
      supabaseClient.storage
        .from("live-covers")
        .getPublicUrl(filePath);

    const coverUrl =
      publicUrlData.publicUrl;

    console.log("Cover uploaded:", coverUrl);

    /* CREATE ROOM NAME */
    const roomName =
      "eman-live-" + Date.now();

    /* CREATE LIVE ROOM IN SUPABASE */
    console.log("Creating live room...");

    const {
      error: roomError
    } =
      await supabaseClient
        .from("live_rooms")
        .insert({
          host_id: user.id,
          room_name: roomName,
          title: liveTitle,
          cover_photo: coverUrl,
          live_type: "live",
          status: "live",
          viewer_count: 0
        });

    if (roomError) {
      throw roomError;
    }

    /* SAVE CURRENT ROOM */
    currentRoomName = roomName;

    console.log(
      "Live room created:",
      roomName
    );

    /* CONNECT TO LIVEKIT */
    await goLive(roomName);

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
   CONNECT TO LIVEKIT
========================================================= */

async function goLive(roomName) {

  try {

    console.log(
      "Connecting to LiveKit:",
      roomName
    );

    /* GET LIVEKIT CREDENTIALS */
    const credentials =
      await getLiveKitToken(roomName);

    if (
      !credentials ||
      !credentials.serverUrl ||
      !credentials.participantToken
    ) {
      throw new Error(
        "LiveKit credentials are missing."
      );
    }

    /* CREATE LIVEKIT ROOM */
    room =
      new LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true
      });

    /* CONNECT */
    await room.connect(
      credentials.serverUrl,
      credentials.participantToken
    );

    console.log(
      "Connected to LiveKit."
    );

    /* ENABLE CAMERA */
    await room.localParticipant
      .setCameraEnabled(true);

    /* ENABLE MICROPHONE */
    await room.localParticipant
      .setMicrophoneEnabled(true);

    console.log(
      "Camera and microphone enabled."
    );

    /* FIND LOCAL VIDEO */
    room.localParticipant
      .videoTrackPublications
      .forEach(publication => {

        if (!publication.track) {
          return;
        }

        localVideoTrack =
          publication.track;

        const video =
          document.createElement("video");

        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;

        localVideoTrack.attach(video);

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

        if (container) {

          container.innerHTML = "";

          container.appendChild(video);

        } else {

          console.warn(
            "Live video container not found."
          );

        }

      });


    /* FIND LOCAL AUDIO */
    room.localParticipant
      .audioTrackPublications
      .forEach(publication => {

        if (publication.track) {

          localAudioTrack =
            publication.track;

        }

      });


    /* OPEN FULLSCREEN LIVE */
    const fullscreen =
      document.getElementById(
        "liveFullscreen"
      );

    if (fullscreen) {

      fullscreen.classList.add("open");

    }


    /* CLOSE SETUP MODAL */
    closeModal("liveModal");


    /* RESET COVER FORM */
    liveCoverFile = null;

    const coverInput =
      document.getElementById(
        "liveCoverInput"
      );

    if (coverInput) {
      coverInput.value = "";
    }

    const coverPreview =
      document.getElementById(
        "liveCoverPreview"
      );

    if (coverPreview) {

      coverPreview.src = "";
      coverPreview.style.display =
        "none";

    }


    /* RESET TITLE */
    const titleInput =
      document.getElementById(
        "liveTitleInput"
      );

    if (titleInput) {
      titleInput.value = "";
    }


    /* START VIEWER COUNT */
    viewerCount = 0;

    const viewerElement =
      document.getElementById(
        "viewerCount"
      );

    if (viewerElement) {
      viewerElement.textContent =
        "0";
    }


    console.log(
      "🎥 EMAN LIVE IS NOW LIVE!"
    );


  } catch (error) {

    console.error(
      "LiveKit connection error:",
      error
    );

    /* CLEAN UP FAILED CONNECTION */

    try {

      if (room) {
        room.disconnect();
      }

    } catch (disconnectError) {

      console.error(
        "Disconnect error:",
        disconnectError
      );

    }

    room = null;

    currentRoomName = null;

    alert(
      "LiveKit error: " +
      (error.message || error)
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

/* =========================================================
   EMAN LIVE AUTHENTICATION
========================================================= */

let authMode = "login";


function openAuth(mode = "login") {

  authMode = mode;

  const modal =
    document.getElementById("authModal");

  if (!modal) {
    alert("Login window could not be found.");
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
    document.getElementById("authTitle");

  const subtitle =
    document.getElementById("authSubtitle");

  const button =
    document.getElementById("authMainButton");

  const switchButton =
    document.getElementById("authSwitchButton");

  const confirmPassword =
    document.getElementById(
      "authConfirmPassword"
    );

  const message =
    document.getElementById("authMessage");

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
    document.getElementById("authEmail");

  const passwordInput =
    document.getElementById("authPassword");

  const confirmInput =
    document.getElementById(
      "authConfirmPassword"
    );

  const message =
    document.getElementById("authMessage");

  if (!emailInput || !passwordInput) {
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

    if (password !== confirmPassword) {

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


      /* CREATE PROFILE */

      if (data && data.user) {

        await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            username:
              email.split("@")[0]
          });

      }


      message.textContent =
        "✅ Account created successfully!";


      setTimeout(() => {

        closeModal("authModal");

      }, 1000);


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


    setTimeout(() => {

      closeModal("authModal");

    }, 700);


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
   AUTH STATUS
========================================================= */

async function getCurrentUser() {

  const {
    data: { user }
  } =
    await supabaseClient.auth.getUser();

  return user;
}


/* =========================================================
   REQUIRE LOGIN BEFORE LIVE
========================================================= */

async function requireLogin() {

  const user =
    await getCurrentUser();

  if (user) {
    return true;
  }

  openAuth("login");

  return false;
       }
