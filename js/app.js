function openLive() {
  document.getElementById("liveModal").classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function openParty() {
  document.getElementById("partyModal").classList.add("open");
}

function openGifts() {
  document.getElementById("giftModal").classList.add("open");
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const video = document.getElementById("previewVideo");

    if (video) {
      video.srcObject = stream;
    }
  } catch (error) {
    alert("Camera or microphone permission was denied.");
  }
}    ' coins deducted (demo).'
  );

  closeModal('giftModal');
}
