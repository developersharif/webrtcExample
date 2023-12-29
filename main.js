import "./style.css";
import {
  createRoomId,
  addSdpAnswer,
  createSdpOffer,
  getSignal,
  loginAnonymous,
  onGetSignals,
  addIceCandidate,
  resetRoom,
} from "./config/firebase";
//Firebase Document Id
const roomId = new URLSearchParams(document.location.search).get("room");
//SDP Description Buttons
const chatLinkButton = document.getElementById("createLink");
const sdpOfferLink = document.getElementById("sdpOfferLink");
const copy = document.getElementById("copy");
const menu = document.getElementById("menu");
const dashboard = document.getElementById("dashboard");
const controls = document.getElementById("controls");
const app = document.getElementById("app");
const closeChat = document.getElementById("closeChat");
//create Room ID by creating a new Document
async function generateRoomId() {
  chatLinkButton.innerText = "Creating...";
  console.log("creating Room link");
  const link = await createRoomId();
  sdpOfferLink.value = link;
  chatLinkButton.innerText = "Create Chat Link";
}
//When Room is exist
if (roomId) {
  menu.classList.add("hidden");
  controls.classList.remove("hidden");
  app.classList.remove("hidden");
  //STUN,TURN server info can be pass to RTCPeerConnection object constructor
  const peerConfiguration = {};
  async function getIcerServers() {

  }
  // getIcerServers();
  //Peer Connection Installation
  const peerConnection = new RTCPeerConnection(peerConfiguration);
  let localStream;
  let remoteStream;

  //Local User Stream
  const localVideo = document.getElementById("localVideo");
  //Remote User Stream
  const remoteVideo = document.getElementById("remoteVideo");
  //UI Controllers
  const muteButton = document.getElementById("muteButton");
  const videoButton = document.getElementById("videoButton");
  //default options
  const localStreamConstrains = {
    video: true,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  };
  let isAudioMuted = true;
  let isVideoEnabled = true;
  //helper function
  async function isCaller() {
    const currentUser = await loginAnonymous();
    const userUid = await currentUser.uid;
    const data = await getSignal(roomId);
    const isMe = (await data.data().callerId) === userUid;
    return isMe;
  }
  async function getRoom() {
    const currentUser = await loginAnonymous();
    const userUid = await currentUser.uid;
    const doc = await getSignal(roomId);
    return doc.data();
  }

  //Initialize First Step
  async function init() {
    localStream = await navigator.mediaDevices.getUserMedia(
      localStreamConstrains
    );
    remoteStream = new MediaStream();
    localVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
    peerConnection.ontrack = (event) => {
      //Track First Stream for ONE to ONE Peer Connection
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };
    //UI Events
    muteButton.onclick = () => {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioMuted;
      });
      isAudioMuted = !isAudioMuted;
      muteButton.innerHTML = isAudioMuted
        ? '<i class="fa-solid fa-microphone"></i>'
        : '<i class="fa-solid fa-microphone-slash"></i>';
    };

    videoButton.onclick = () => {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoEnabled = !isVideoEnabled;
      });
      videoButton.innerHTML = isVideoEnabled
        ? '<i class="fa-solid fa-video"></i>'
        : '<i class="fa-solid fa-video-slash"></i>';
    };
    closeChat.onclick = () => {
      var currentUrl = window.location.href;
      var homepage = currentUrl.split("?")[0];
      window.location.href = homepage;
    };
  }

  //Generate SDP for Remote Peer
  async function generateSdpOffer() {
    try {
      if (!!(await isCaller())) {
        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            await addIceCandidate(roomId, JSON.stringify(event.candidate));
            console.log(`New Ice Candidate ${JSON.stringify(event.candidate)}`);
          }
        };
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        const sdpOffer = JSON.stringify(peerConnection.localDescription);
        await createSdpOffer(roomId, sdpOffer);
        console.log(sdpOffer);
      }
    } catch (error) {
      console.error("Error creating or setting local description:", error);
    }
  }

  //Generate SDP Answer
  async function createSdpAnswer() {
    if (!(await isCaller())) {
      console.log("creating SDP answer");
      const storedOffer = await getRoom();
      const offer = await storedOffer.offer;
      if (offer && !peerConnection.currentRemoteDescription) {
        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            const sdpAnswer = JSON.stringify(peerConnection.localDescription);
            await addSdpAnswer(roomId, sdpAnswer);
            console.log(sdpAnswer);
          }
        };
        const offerDescription = new RTCSessionDescription(JSON.parse(offer));
        await peerConnection.setRemoteDescription(offerDescription);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
      }
    }
  }

  init();
  setTimeout(async () => {
    generateSdpOffer();
    createSdpAnswer();
    //add Remote Answer Callee
    onGetSignals(roomId, async (snapshot) => {
      if (snapshot.exists()) {
        let storedAnswer = await snapshot.data().answer;
        if (
          storedAnswer &&
          (await isCaller()) &&
          !peerConnection.currentRemoteDescription
        ) {
          const parsedAnswer = new RTCSessionDescription(
            JSON.parse(storedAnswer)
          );
          await peerConnection.setRemoteDescription(parsedAnswer);
          console.log(storedAnswer);
        } else {
          //if not generated answer yet
          createSdpAnswer();
        }
        let iceCandidate = await snapshot.data().candidate;
        if (
          iceCandidate !== undefined &&
          peerConnection.currentRemoteDescription &&
          !(await isCaller())
        ) {
          if (peerConnection) {
            console.log("IceCandidate Added");
            const candidate = JSON.parse(iceCandidate);
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } else {
        console.log(`Document with roomId ${roomId} does not exist.`);
      }
    });
  }, 200);
  //On Close event
  window.addEventListener("beforeunload", async (e) => {
    peerConnection.close();
    await resetRoom(roomId);
  });
  //End Room Logic
} else {
  //outside of room
  chatLinkButton.onclick = generateRoomId;
  menu.onclick = () => {
    dashboard.classList.toggle("hidden");
  };
  copy.onclick = () => {
    sdpOfferLink.select();
    sdpOfferLink.setSelectionRange(0, 99999);
    document.execCommand("copy");
    copy.innerText = "Copied";
  };
  console.log("Room not exist");
}
