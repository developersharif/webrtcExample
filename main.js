import "./style.css"
//STUN,TURN server info can be pass to RTCPeerConnection object constructor
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  // {
  //   urls: 'turn:turn-server.com:3478',
  //   username: 'username',
  //   credential: 'password'
  // }
];

//Peer Connection Installation
const peerConnection = new RTCPeerConnection({iceServers});
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

//default options
const localStreamConstrains = {video:true,audio:false}

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

//Event handlers
createOfferButton.onclick = createOffer
createAnswerButton.onclick = createAnswer
addAnswerButton.onclick = addAnswer