import "./style.css"
//STUN,TURN server info can be pass to RTCPeerConnection object constructor
const peerConfiguration = {}
async function getIcerServers() {
  // const response = await fetch("https://realbrain.metered.live/api/v1/turn/credentials?apiKey=ff29501ba025c8ffea1ec276bffc4f8dd96f");
  // const iceServers = await response.json();
  // peerConfiguration.iceServers = iceServers
};
getIcerServers();
//Peer Connection Installation
const peerConnection = new RTCPeerConnection(peerConfiguration);
let localStream;
let remoteStream;

//Local User Stream
const localVideo = document.getElementById("localVideo");
//Remote User Stream
const remoteVideo = document.getElementById("remoteVideo");
//SDP Description Buttons
const createOfferButton = document.getElementById("create_offer");
const createAnswerButton = document.getElementById("create_answer");
const addAnswerButton = document.getElementById("add_answer");
const sdpOffer = document.getElementById("sdp_offer");
const sdpAnswer = document.getElementById("sdp_answer");
const muteButton = document.getElementById("muteButton");
const videoButton = document.getElementById("videoButton");
const menu = document.getElementById("menu");
const dashboard = document.getElementById("dashboard");
//default options
const localStreamConstrains = {video:true,audio:true}
let isAudioMuted = true;
let isVideoEnabled = true;
init();
//Initialize First Step
async function init(){
  localStream = await navigator.mediaDevices.getUserMedia(localStreamConstrains);
  remoteStream = new MediaStream();
  localVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;
  localStream.getTracks().forEach(track=>{
    peerConnection.addTrack(track,localStream);
  });
  peerConnection.ontrack = event=>{
    //Track First Stream for ONE to ONE Peer Connection
    event.streams[0].getTracks().forEach(track=>{
      remoteStream.addTrack(track)
    })
  }
}

//Generate SDP Description for Remote User
async function createOffer(){
  peerConnection.onicecandidate = event=>{
    console.log(event);
    if(event.candidate){
      sdpOffer.value = JSON.stringify(peerConnection.localDescription)
    }
  }
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer)
}
//Generate Answer Using Offer SDP
async function createAnswer() {
    const offer = sdpOffer.value;
    const offerDescription = new RTCSessionDescription(JSON.parse(offer));
    await peerConnection.setRemoteDescription(offerDescription);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    sdpAnswer.value = JSON.stringify(peerConnection.localDescription);
}


//add Remote User Stream using SDP answer
async function addAnswer(){
  if(!peerConnection.currentRemoteDescription){
    const answer = new RTCSessionDescription(JSON.parse(sdpAnswer.value));
    peerConnection.setRemoteDescription(answer)
  }
}
muteButton.onclick  = () => {
  localStream.getAudioTracks().forEach(track => {
      track.enabled = !isAudioMuted;
  });
  isAudioMuted = !isAudioMuted;
  muteButton.innerHTML = isAudioMuted ? '<i class="fa-solid fa-microphone"></i>' : '<i class="fa-solid fa-microphone-slash"></i>';
};

videoButton.onclick =  () => {
  localStream.getVideoTracks().forEach(track => {
      track.enabled = isVideoEnabled = !isVideoEnabled;
  });
  videoButton.innerHTML = isVideoEnabled ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-video-slash"></i>';
};
menu.onclick = ()=>{
  dashboard.classList.toggle('hidden');
}
//Event handlers
createOfferButton.onclick = createOffer
createAnswerButton.onclick = createAnswer
addAnswerButton.onclick = addAnswer