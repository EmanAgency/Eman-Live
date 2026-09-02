const hosts=[
  ['Angel','8.9K','A'],
  ['Bella','6.2K','B'],
  ['Maya','4.8K','M'],
  ['Nana','3.1K','N'],
  ['Lina','2.7K','L'],
  ['Kira','2.1K','K']
];

const parties=[
  ['VIP Girls Party','Angel','Bella','Maya','Nana','24.6K'],
  ['Music & Chat','Lina','Kira','Angel','Bella','12.3K'],
  ['Friends Lounge','Maya','Nana','Lina','Kira','8.7K']
];

document.getElementById('rooms').innerHTML=hosts.map(h=>`
  <article class="room">
    <div class="thumb">
      <div class="avatar">${h[2]}</div>
      <div class="live">● LIVE</div>
    </div>
    <div class="info">
      <div class="name">${h[0]} ❤️</div>
      <div class="small">${h[1]} viewers</div>
    </div>
  </article>
`).join('');

document.getElementById('partyRooms').innerHTML=parties.map((p,i)=>`
  <article class="partyCard">
    <div class="miniGrid">
      ${p.slice(1,5).map(x=>`
        <div class="miniVideo">
          <b>${x} ❤️</b>
        </div>
      `).join('')}
    </div>

    <div class="partyFooter">
      <div>
        <strong>🎉 ${p[0]}</strong>
        <div class="small">${p[5]} viewers • 4 hosts</div>
      </div>
      <button class="btn" onclick="openParty(${i})">Join</button>
    </div>
  </article>
`).join('');

function openGifts(){
  document.getElementById('giftModal').classList.add('open');
}

function openLive(){
  document.getElementById('liveModal').classList.add('open');
}l

  document.getElementById('liveModal').classList.add('open');
}

function openParty(index=0){
  document.getElementById('partyModal').classList.add('open');

  document.getElementById('videoGrid').innerHTML=
    parties[index].slice(1,5).map(x=>`
      <div class="video">
        <span>${x} ❤️</span>
      </div>
    `).join('');
}

function closeModal(id){
  document.getElementById(id).classList.remove('open');
}

function gift(name,c){
  let balance=parseInt(
    document.getElementById('coinBalance')
      .textContent
      .replace(/,/g,'')
  );

  if(balance<c){
    alert('Not enough Eman Coins.');
    return;
  }
let cameraStream;

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
const video = document.getElementById("previewVideo");
video.srcObject = cameraStream;
    alert("Camera and microphone are ready!");
  } catch (error) {
    alert("Camera or microphone permission was denied.");
  }
}
  balance-=c;

  document.getElementById('coinBalance').textContent=
    balance.toLocaleString();

  document.getElementById('walletCoins').textContent=
    balance.toLocaleString();

  alert(
    name+' sent! '+
    c.toLocaleString()+
    ' coins deducted (demo).'
  );

  closeModal('giftModal');
}
