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

function openLive() {

  const modal =
    document.getElementById("liveModal");

  if (modal) {
    modal.classList.add("open");
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


// =========================
// CAMERA PREVIEW
// =========================

async function startCamera() {

  try {

    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

    const video =
      document.getElementById("previewVideo");

    if (video) {

      video.srcObject =
        cameraStream;

      video.muted = true;
      video.playsInline = true;

      await video.play();
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
// GET / CREATE DATABASE ROOM
// =========================

async function getOrCreateDatabaseRoom(
  hostName = "Eman Host"
) {

  try {

    // Look for existing live room
    const { data: existingRoom, error: findError } =
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


    // Create a new room
    const { data: newRoom, error: createError } =
      await supabaseClient
        .from("live_rooms")
        .insert({
          host_name: hostName,
          title: "Live Stream",
          is_live: true
        })
        .select()
        .single();

    if (createError) {
      throw createError;
    }

    databaseRoomId =
      newRoom.id;

    return newRoom;

  } catch (error) {

    console.error(
      "Database room error:",
      error
    );

    throw error;
  }
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

      // New chat / join / leave events
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


          if (
            data.event_type ===
            "join"
          ) {

            addSystemMessage(
              "👋 " +
              data.user_name +
              " joined the live"
            );

            return;
          }


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
// SEND DATABASE EVENT
// =========================

async function sendLiveEvent(
  roomId,
  userName,
  eventType,
  message
) {

  try {

    const { error } =
      await supabaseClient
        .from("live_messages")
        .insert({
          room_id: roomId,
          user_name: userName,
          message: message,
          event_type: eventType
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


    // Create database room
    const dbRoom =
      await getOrCreateDatabaseRoom(
        hostName
      );


    // Start Supabase realtime
    subscribeToLive(
      dbRoom.id
    );


    // Stop preview camera
    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

      cameraStream = null;
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


    // Viewer joins/leaves
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


    // Camera + microphone
    await room.localParticipant
      .enableCameraAndMicrophone();


    // Show host camera
    const video =
      document.getElementById(
        "previewVideo"
      );


    const publication =
      room.localParticipant
        .getTrackPublication(
          LivekitClient.Track.Source.Camera
        );


    if (
      publication &&
      publication.track &&
      video
    ) {

      publication.track.attach(
        video
      );

      video.muted = true;
      video.playsInline = true;

      await video
        .play()
        .catch(() => {});
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


    alert(
      "🔴 EMAN LIVE is now LIVE!"
    );


    console.log(
      "Eman Live room:",
      roomName
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
// VIEWER COUNT
// =========================

function updateViewerCount() {

  if (!room) return;


  const count =
    room.remoteParticipants.size +
    1;


  const viewerCount =
    document.getElementById(
      "viewerCount"
    );


  if (viewerCount) {

    viewerCount.innerText =
      count;
  }


  console.log(
    "Viewer count:",
    count
  );
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


    // Find current live room
    const { data: liveRoom, error } =
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


    // Subscribe BEFORE announcing join
    subscribeToLive(
      databaseRoomId
    );


    // Add participant
    await supabaseClient
      .from("live_participants")
      .insert({

        room_id:
          databaseRoomId,

        user_name:
          userName

      });


    // Announce join
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


    // Receive host video
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


    // Viewer connected
    viewerRoom.on(
      LivekitClient.RoomEvent.ParticipantConnected,
      participant => {

        console.log(
          "Connected:",
          participant.identity
        );
      }
    );


    await viewerRoom.connect(
      credentials.serverUrl,
      credentials.participantToken
    );


    // Existing host tracks
    viewerRoom.remoteParticipants.forEach(
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


  if (!rooms) return;


  rooms.innerHTML = "";


  const video =
    document.createElement(
      "video"
    );


  video.autoplay = true;
  video.playsInline = true;
  video.controls = false;


  video.style.width =
    "100%";

  video.style.maxWidth =
    "600px";

  video.style.borderRadius =
    "15px";

  video.style.background =
    "#000";


  track.attach(
    video
  );


  rooms.appendChild(
    video
  );


  video.play()
    .catch(() => {});


  console.log(
    "Host video displayed."
  );
}


// =========================
// CHAT
// =========================

async function sendLiveChat() {

  const input =
    document.getElementById(
      "chatInput"
    );


  const messages =
    document.getElementById(
      "chatMessages"
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


  if (!databaseRoomId) {

    alert(
      "You must join a live room first."
    );

    return;
  }


  const userName =
    getUserName();


  try {

    const { error } =
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


    input.value = "";


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
// DISPLAY CHAT MESSAGE
// =========================

function addChatMessage(
  name,
  message,
  mine = false
) {

  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (!messages) return;


  const p =
    document.createElement(
      "p"
    );


  p.textContent =
    name +
    ": " +
    message;


  messages.appendChild(
    p
  );


  messages.scrollTop =
    messages.scrollHeight;
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


  if (!messages) return;


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


// Compatibility with old button
function sendChatMessage() {
  sendLiveChat();
}


// =========================
// END LIVE
// =========================

async function stopLive() {

  try {

    // Tell viewers host stopped
    if (databaseRoomId) {

      await sendLiveEvent(
        databaseRoomId,
        "Eman Host",
        "leave",
        "ended the live"
      );


      await supabaseClient
        .from("live_rooms")
        .update({
          is_live: false
        })
        .eq(
          "id",
          databaseRoomId
        );
    }


    if (room) {

      await room.disconnect();

      room = null;
    }


    if (viewerRoom) {

      await viewerRoom.disconnect();

      viewerRoom = null;
    }


    if (localVideoTrack) {

      localVideoTrack.stop();

      localVideoTrack = null;
    }


    if (localAudioTrack) {

      localAudioTrack.stop();

      localAudioTrack = null;
    }


    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

      cameraStream = null;
    }


    if (realtimeChannel) {

      await supabaseClient
        .removeChannel(
          realtimeChannel
        );

      realtimeChannel = null;
    }


    const video =
      document.getElementById(
        "previewVideo"
      );


    if (video) {

      video.srcObject =
        null;
    }


    const liveButton =
      document.getElementById(
        "goLiveButton"
      );


    if (liveButton) {

      liveButton.innerText =
        "🔴 GO LIVE";
    }


    alert(
      "Live stream ended."
    );


  } catch (error) {

    console.error(
      "End live error:",
      error
    );
  }
}
