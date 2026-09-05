const TOKEN_SERVER_ID = "emanlive-2j2epi";

const SUPABASE_URL = "https://kzuaaihvehqhipwmrzal.supabase.co";
const SUPABASE_KEY = "sb_publishable_LsGL8Os9cgqLmItWgk0ADg_nBWuLs7I";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentRoomName = null;
let room = null;
let viewerRoom = null;

let localVideoTrack = null;
let localAudioTrack = null;
let cameraStream = null;

let databaseRoomId = null;
let realtimeChannel = null;

let facingMode = "user";


// =========================
// USER NAME
// =========================

function getUserName() {

  let name = localStorage.getItem("emanLiveUserName");

  if (!name) {

    name =
      "User-" +
      Math.floor(1000 + Math.random() * 9000);

    localStorage.setItem(
      "emanLiveUserName",
      name
    );
  }

  return name;
}


// =========================
// MODALS
// =========================

async function openLive() {

  try {

    // Open camera immediately
    await startCamera();

    // Close the old Go Live popup
    closeModal("liveModal");

    // Show fullscreen camera
    const screen =
      document.getElementById("liveFullscreen");

    if (screen) {
      screen.classList.add("open");
    }

    document.body.style.overflow = "hidden";

    // Put preview camera into fullscreen video
    const preview =
      document.getElementById("previewVideo");

    const fullVideo =
      document.getElementById("fullLiveVideo");

    if (
      preview &&
      fullVideo &&
      cameraStream
    ) {

      fullVideo.srcObject =
        cameraStream;

      fullVideo.muted = true;
      fullVideo.autoplay = true;
      fullVideo.playsInline = true;

      await fullVideo.play()
        .catch(() => {});
    }

  } catch (error) {

    console.error(
      "Open Live error:",
      error
    );

  }
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

  if (modal) {
    modal.classList.add("open");
  }
}


function openGifts() {

  const modal =
    document.getElementById("giftModal");

  if (modal) {
    modal.classList.add("open");
  }
}


// =========================
// GIFTS
// =========================

function gift(name, cost) {

  alert(
    name +
    " selected — " +
    cost +
    " coins"
  );
}


function openGiftsFromLive() {

  openGifts();
}


// =========================
// CAMERA PREVIEW
// =========================

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
        .forEach(track => track.stop());
    }


    cameraStream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: facingMode
        },

        audio: true

      });


    const video =
      document.getElementById(
        "previewVideo"
      );


    if (video) {

      video.srcObject =
        cameraStream;

      video.muted = true;
      video.playsInline = true;

      await video.play()
        .catch(() => {});
    }


    console.log(
      "Camera and microphone ready."
    );

  } catch (error) {

    console.error(error);

    alert(
      "Camera could not start: " +
      (error.message || error)
    );
  }
}


// =========================
// DATABASE ROOM
// =========================

async function getOrCreateDatabaseRoom(
  hostName = "Eman Host"
) {

  const {
    data: existingRoom,
    error: findError
  } =
    await supabaseClient
      .from("live_rooms")
      .select("*")
      .eq("is_live", true)
      .eq("title", "Live Stream")
      .order("created_at", {
        ascending: false
      })
      .limit(1)
      .maybeSingle();


  if (findError) {
    throw findError;
  }


  if (existingRoom) {

    databaseRoomId =
      existingRoom.id;

    return existingRoom;
  }


  const {
    data: newRoom,
    error: createError
  } =
    await supabaseClient
      .from("live_rooms")
      .insert({

        host_name:
          hostName,

        title:
          "Live Stream",

        is_live:
          true

      })
      .select()
      .single();


  if (createError) {
    throw createError;
  }


  databaseRoomId =
    newRoom.id;


  return newRoom;
}


// =========================
// REALTIME
// =========================

function subscribeToLive(roomId) {

  if (realtimeChannel) {

    supabaseClient.removeChannel(
      realtimeChannel
    );

    realtimeChannel = null;
  }


  realtimeChannel =
    supabaseClient
      .channel(
        "eman-live-" + roomId
      )

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_messages",
          filter:
            "room_id=eq." + roomId
        },

        payload => {

          const data =
            payload.new;

          if (!data) return;


          // USER JOINED
          if (
            data.event_type ===
            "join"
          ) {

            addSystemMessage(
              "👋 " +
              data.user_name +
              " joined the live"
            );


            showJoinNotification(
              data.user_name
            );


            return;
          }


          // USER LEFT
          if (
            data.event_type ===
            "leave"
          ) {

            addSystemMessage(
              "🚪 " +
              data.user_name +
              " left the live"
            );


            return;
          }


          // CHAT
          if (
            data.event_type ===
            "message"
          ) {

            addChatMessage(
              data.user_name,
              data.message,
              false
            );

          }

        }
      )

      .subscribe(status => {

        console.log(
          "Eman Live Realtime:",
          status
        );

      });
}


// =========================
// SEND EVENT
// =========================

async function sendLiveEvent(
  roomId,
  userName,
  eventType,
  message
) {

  try {

    const {
      error
    } =
      await supabaseClient
        .from("live_messages")
        .insert({

          room_id:
            roomId,

          user_name:
            userName,

          message:
            message,

          event_type:
            eventType

        });


    if (error) {
      throw error;
    }

  } catch (error) {

    console.error(
      "Realtime event error:",
      error
    );
  }
}


// =========================
// GO LIVE
// =========================

async function goLive() {

  try {

    if (!window.LivekitClient) {

      alert(
        "LiveKit is not loaded. Please refresh the page."
      );

      return;
    }


    const hostName =
      "Eman Host";


    // DATABASE ROOM
    const dbRoom =
      await getOrCreateDatabaseRoom(
        hostName
      );


    databaseRoomId =
      dbRoom.id;


    subscribeToLive(
      databaseRoomId
    );


    // STOP PREVIEW
    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

      cameraStream =
        null;
    }


    const tokenSource =
      LivekitClient.TokenSource
        .developmentTokenServer(
          TOKEN_SERVER_ID
        );


    const roomName =
      "eman-live-main";


    currentRoomName =
      roomName;


    const credentials =
      await tokenSource.fetch({

        roomName:
          roomName,

        participantName:
          hostName

      });


    room =
      new LivekitClient.Room();


    // PARTICIPANT JOIN
    room.on(
      LivekitClient.RoomEvent.ParticipantConnected,

      participant => {

        console.log(
          "Participant joined:",
          participant.identity
        );


        updateViewerCount();

      }
    );


    // PARTICIPANT LEAVE
    room.on(
      LivekitClient.RoomEvent.ParticipantDisconnected,

      participant => {

        console.log(
          "Participant left:",
          participant.identity
        );


        updateViewerCount();

      }
    );


    await room.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    // CAMERA + MICROPHONE
    await room.localParticipant
      .enableCameraAndMicrophone();


    localVideoTrack =
      room.localParticipant
        .getTrackPublication(
          LivekitClient.Track.Source.Camera
        )?.track || null;


    localAudioTrack =
      room.localParticipant
        .getTrackPublication(
          LivekitClient.Track.Source.Microphone
        )?.track || null;


    // FULLSCREEN VIDEO
    const video =
      document.getElementById(
        "fullLiveVideo"
      );


    if (
      localVideoTrack &&
      video
    ) {

      localVideoTrack.attach(
        video
      );

      video.muted =
        true;

      video.playsInline =
        true;

      await video.play()
        .catch(() => {});
    }


    // OLD PREVIEW
    const preview =
      document.getElementById(
        "previewVideo"
      );


    if (
      localVideoTrack &&
      preview
    ) {

      localVideoTrack.attach(
        preview
      );

      preview.muted =
        true;

      preview.playsInline =
        true;

    }


    updateViewerCount();


    const liveButton =
      document.getElementById(
        "goLiveButton"
      );


    if (liveButton) {

      liveButton.innerText =
        "🔴 LIVE";

    }


    // CLOSE GO LIVE MODAL
    closeModal(
      "liveModal"
    );


    // OPEN FULLSCREEN
    openFullscreenLive();

const fullscreen =
  document.getElementById(
    "liveFullscreen"
  );

if (fullscreen) {
  fullscreen.classList.add("isLive");
}

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
      (error.message || error)
    );
  }
}


// =========================
// FULLSCREEN
// =========================

async function startLiveFromFullscreen() {

  // If camera is already running,
  // stop the preview tracks before LiveKit takes over.
  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;
  }

  await goLive();

}

function openFullscreenLive() {

  const screen =
    document.getElementById(
      "liveFullscreen"
    );


  if (!screen) return;


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


// =========================
// JOIN NOTIFICATION
// =========================

function showJoinNotification(
  userName
) {

  const container =
    document.getElementById(
      "joinOverlay"
    );


  if (!container) return;


  const notice =
    document.createElement(
      "div"
    );


  notice.className =
    "joinNotice";


  const avatar =
    document.createElement(
      "span"
    );


  avatar.className =
    "joinAvatar";


  avatar.textContent =
    userName
      .charAt(0)
      .toUpperCase();


  const text =
    document.createElement(
      "span"
    );


  text.textContent =
    userName +
    " joined the live";


  notice.appendChild(
    avatar
  );


  notice.appendChild(
    text
  );


  container.appendChild(
    notice
  );


  setTimeout(() => {

    notice.remove();

  }, 5000);
}


// =========================
// VIEWER COUNT
// =========================

function updateViewerCount() {

  let count = 1;


  if (room) {

    count =
      room.remoteParticipants.size +
      1;

  }


  if (viewerRoom) {

    count =
      viewerRoom.remoteParticipants.size;

  }


  const viewerCount =
    document.getElementById(
      "viewerCount"
    );


  const fullViewerCount =
    document.getElementById(
      "fullViewerCount"
    );


  if (viewerCount) {

    viewerCount.innerText =
      count;

  }


  if (fullViewerCount) {

    fullViewerCount.innerText =
      count;

  }
}


// =========================
// WATCH LIVE
// =========================

async function watchLive() {

  try {

    if (!window.LivekitClient) {

      alert(
        "LiveKit is not loaded."
      );

      return;
    }


    const {
      data: liveRoom,
      error
    } =
      await supabaseClient
        .from("live_rooms")
        .select("*")
        .eq("is_live", true)
        .order("created_at", {
          ascending: false
        })
        .limit(1)
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!liveRoom) {

      alert(
        "There is no live stream right now."
      );

      return;
    }


    databaseRoomId =
      liveRoom.id;


    const userName =
      getUserName();


    subscribeToLive(
      databaseRoomId
    );


    // REGISTER VIEWER
    const {
      error: participantError
    } =
      await supabaseClient
        .from("live_participants")
        .insert({

          room_id:
            databaseRoomId,

          user_name:
            userName

        });


    if (participantError) {

      console.error(
        "Participant error:",
        participantError
      );

    }


    // JOIN EVENT
    await sendLiveEvent(
      databaseRoomId,
      userName,
      "join",
      "joined the live"
    );


    const tokenSource =
      LivekitClient.TokenSource
        .developmentTokenServer(
          TOKEN_SERVER_ID
        );


    const credentials =
      await tokenSource.fetch({

        roomName:
          "eman-live-main",

        participantName:
          userName

      });


    viewerRoom =
      new LivekitClient.Room();


    // HOST VIDEO
    viewerRoom.on(
      LivekitClient.RoomEvent.TrackSubscribed,

      (
        track,
        publication,
        participant
      ) => {

        if (
          track.kind ===
          LivekitClient.Track.Kind.Video
        ) {

          showViewerVideo(
            track
          );

        }

      }
    );


    // PARTICIPANT JOIN
    viewerRoom.on(
      LivekitClient.RoomEvent.ParticipantConnected,

      participant => {

        console.log(
          "Connected:",
          participant.identity
        );


        updateViewerCount();

      }
    );


    // PARTICIPANT LEAVE
    viewerRoom.on(
      LivekitClient.RoomEvent.ParticipantDisconnected,

      participant => {

        updateViewerCount();

      }
    );


    await viewerRoom.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    // EXISTING TRACKS
    viewerRoom.remoteParticipants
      .forEach(
        participant => {

          participant.trackPublications
            .forEach(
              publication => {

                if (
                  publication.track
                ) {

                  showViewerVideo(
                    publication.track
                  );

                }

              }
            );

        }
      );


    updateViewerCount();


    // FULLSCREEN
    openFullscreenLive();


    alert(
      "👀 You joined Eman Live!"
    );


  } catch (error) {

    console.error(
      "Viewer error:",
      error
    );


    alert(
      "Viewer error: " +
      (error.message || error)
    );

  }
}


// =========================
// SHOW VIEWER VIDEO
// =========================

function showViewerVideo(track) {

  if (
    !track ||
    track.kind !==
    LivekitClient.Track.Kind.Video
  ) {
    return;
  }


  const rooms =
    document.getElementById(
      "rooms"
    );


  const video =
    document.getElementById(
      "fullLiveVideo"
    );


  if (video) {

    video.muted =
      true;

    video.playsInline =
      true;


    track.attach(
      video
    );


    video.play()
      .catch(() => {});

  }


  if (rooms) {

    rooms.innerHTML = "";


    const smallVideo =
      document.createElement(
        "video"
      );


    smallVideo.autoplay =
      true;

    smallVideo.playsInline =
      true;

    smallVideo.controls =
      false;

    smallVideo.style.width =
      "100%";

    smallVideo.style.borderRadius =
      "15px";

    smallVideo.style.background =
      "#000";


    track.attach(
      smallVideo
    );


    rooms.appendChild(
      smallVideo
    );

  }


  console.log(
    "Host video displayed."
  );
}


// =========================
// CHAT
// =========================

async function sendLiveChat(
  inputId = "chatInput"
) {

  const input =
    document.getElementById(
      inputId
    );


  if (!input) return;


  const message =
    input.value.trim();


  if (!message) return;


  if (!databaseRoomId) {

    alert(
      "You must join a live room first."
    );

    return;

  }


  const userName =
    getUserName();


  try {

    const {
      error
    } =
      await supabaseClient
        .from("live_messages")
        .insert({

          room_id:
            databaseRoomId,

          user_name:
            userName,

          message:
            message,

          event_type:
            "message"

        });


    if (error) {
      throw error;
    }


    input.value =
      "";

  } catch (error) {

    console.error(
      "Chat send error:",
      error
    );


    alert(
      "Could not send message: " +
      error.message
    );

  }
}


// =========================
// DISPLAY CHAT
// =========================

function addChatMessage(
  name,
  message,
  mine = false
) {

  // NORMAL CHAT
  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (messages) {

    const p =
      document.createElement(
        "p"
      );


    const bold =
      document.createElement(
        "b"
      );


    bold.textContent =
      name + ":";


    p.appendChild(
      bold
    );


    p.appendChild(
      document.createTextNode(
        " " + message
      )
    );


    messages.appendChild(
      p
    );


    messages.scrollTop =
      messages.scrollHeight;

  }


  // FULLSCREEN CHAT
  const fullMessages =
    document.getElementById(
      "fullChatMessages"
    );


  if (fullMessages) {

    const div =
      document.createElement(
        "div"
      );


    div.className =
      "fullChatMessage";


    const bold =
      document.createElement(
        "b"
      );


    bold.textContent =
      name + ":";


    div.appendChild(
      bold
    );


    div.appendChild(
      document.createTextNode(
        " " + message
      )
    );


    fullMessages.appendChild(
      div
    );


    fullMessages.scrollTop =
      fullMessages.scrollHeight;

  }
}


// =========================
// SYSTEM MESSAGE
// =========================

function addSystemMessage(
  message
) {

  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (messages) {

    const p =
      document.createElement(
        "p"
      );


    p.textContent =
      message;


    messages.appendChild(
      p
    );


    messages.scrollTop =
      messages.scrollHeight;

  }
}


// =========================
// OLD CHAT BUTTON
// =========================

function sendChatMessage() {

  sendLiveChat(
    "chatInput"
  );

}


// =========================
// MUTE
// =========================

function toggleLiveMute() {

  if (!localAudioTrack) {

    alert(
      "Microphone is not available."
    );

    return;
  }

  const enabled =
    localAudioTrack.isEnabled;

  localAudioTrack.enable(!enabled);

  const button =
    document.getElementById(
      "liveMuteButton"
    );

  if (button) {

    button.textContent =
      enabled ? "🔇" : "🎤";
  }
}


// =========================
// CAMERA ON / OFF
// =========================

function toggleLiveCamera() {

  if (!localVideoTrack) {

    alert(
      "Camera is not available."
    );

    return;
  }

  const enabled =
    localVideoTrack.isEnabled;

  localVideoTrack.enable(!enabled);

  const button =
    document.getElementById(
      "liveCameraButton"
    );

  if (button) {

    button.textContent =
      enabled ? "📵" : "📹";
  }
}


// =========================
// FLIP CAMERA
// =========================

async function flipLiveCamera() {

  facingMode =
    facingMode === "user"
      ? "environment"
      : "user";

  try {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

      cameraStream = null;
    }

    // If already LIVE, switch LiveKit camera
    if (
      room &&
      room.localParticipant
    ) {

      await room.localParticipant
        .setCameraEnabled(false);

      await room.localParticipant
        .setCameraEnabled(true, {
          facingMode: facingMode
        });

      localVideoTrack =
        room.localParticipant
          .getTrackPublication(
            LivekitClient.Track.Source.Camera
          )?.track || null;

      const video =
        document.getElementById(
          "fullLiveVideo"
        );

      if (
        localVideoTrack &&
        video
      ) {

        localVideoTrack.detach();

        localVideoTrack.attach(video);

        video.muted = true;
        video.playsInline = true;

        await video.play()
          .catch(() => {});
      }

      return;
    }

    // Otherwise restart preview camera
    await startCamera();

    const preview =
      document.getElementById(
        "previewVideo"
      );

    const fullVideo =
      document.getElementById(
        "fullLiveVideo"
      );

    if (
      cameraStream &&
      fullVideo
    ) {

      fullVideo.srcObject =
        cameraStream;

      fullVideo.muted = true;
      fullVideo.playsInline = true;

      await fullVideo.play()
        .catch(() => {});
    }

  } catch (error) {

    console.error(
      "Flip camera error:",
      error
    );

    alert(
      "Could not flip camera: " +
      (error.message || error)
    );
  }
}


// =========================
// STOP LIVE
// =========================

async function stopLive() {

  try {

    // Stop camera preview
    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

      cameraStream = null;
    }


    // Disconnect host
    if (room) {

      room.disconnect();

      room = null;
    }


    localVideoTrack =
      null;

    localAudioTrack =
      null;


    // Mark database room as not live
    if (databaseRoomId) {

      const {
        error
      } =
        await supabaseClient
          .from("live_rooms")
          .update({
            is_live: false
          })
          .eq(
            "id",
            databaseRoomId
          );

      if (error) {

        console.error(
          "Could not end live room:",
          error
        );
      }
    }


    // Remove realtime channel
    if (realtimeChannel) {

      await supabaseClient
        .removeChannel(
          realtimeChannel
        );

      realtimeChannel =
        null;
    }


    databaseRoomId =
      null;

    currentRoomName =
      null;


    // Clear videos
    const preview =
      document.getElementById(
        "previewVideo"
      );

    const fullVideo =
      document.getElementById(
        "fullLiveVideo"
      );

    if (preview) {
      preview.srcObject = null;
    }

    if (fullVideo) {
      fullVideo.srcObject = null;
    }


    // Close fullscreen
    closeFullscreenLive();


// =========================
// MUTE / UNMUTE MICROPHONE
// =========================

// =========================
// MUTE
// =========================

function toggleLiveMute() {

  if (!localAudioTrack) {
    alert("Microphone is not available.");
    return;
  }

  const enabled = localAudioTrack.isEnabled;

  localAudioTrack.enable(!enabled);

  const button =
    document.getElementById("liveMuteButton");

  if (button) {
    button.textContent =
      enabled ? "🔇" : "🎤";
  }
}


// =========================
// CAMERA
// =========================

function toggleLiveCamera() {

  if (!localVideoTrack) {
    alert("Camera is not available.");
    return;
  }

  const enabled = localVideoTrack.isEnabled;

  localVideoTrack.enable(!enabled);

  const button =
    document.getElementById("liveCameraButton");

  if (button) {
    button.textContent =
      enabled ? "📹" : "🚫";
  }
}


// =========================
// FLIP CAMERA
// =========================

async function flipLiveCamera() {

  facingMode =
    facingMode === "user"
      ? "environment"
      : "user";

  try {

    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track => track.stop());

      cameraStream = null;
    }

    await startCamera();

    if (
      room &&
      room.localParticipant
    ) {

      await room.localParticipant
        .setCameraEnabled(false);

      await room.localParticipant
        .setCameraEnabled(true);
    }

  } catch (error) {

    console.error(
      "Flip camera error:",
      error
    );

    alert(
      "Could not flip camera: " +
      (error.message || error)
    );
  }
}


// =========================
// STOP LIVE
// =========================

async function stopLive() {

  try {

    // Stop LiveKit room
    if (room) {

      room.disconnect();

      room = null;
    }


    // Stop viewer room
    if (viewerRoom) {

      viewerRoom.disconnect();

      viewerRoom = null;
    }


    // Stop camera
    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track => track.stop());

      cameraStream = null;
    }


    localVideoTrack = null;
    localAudioTrack = null;


    // Stop realtime
    if (realtimeChannel) {

      await supabaseClient
        .removeChannel(
          realtimeChannel
        );

      realtimeChannel = null;
    }


    // Close fullscreen
    closeFullscreenLive();


    // Close modal
    closeModal("liveModal");


    const video =
      document.getElementById(
        "fullLiveVideo"
      );

    if (video) {
      video.srcObject = null;
    }


    const preview =
      document.getElementById(
        "previewVideo"
      );

    if (preview) {
      preview.srcObject = null;
    }


    document.body.style.overflow = "";


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
