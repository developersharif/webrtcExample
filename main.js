import { Peer } from "https://esm.sh/peerjs@1.5.2?bundle-deps";
import "./style.css";
import {
  createRoomId,
  addLocalId,
  addRemoteId,
  getSignal,
  loginAnonymous,
  onGetSignals,
  resetRoom,
} from "./config/firebase";
const roomId = new URLSearchParams(document.location.search).get("room");
const muteAudioButton = document.getElementById("muteButton");
const muteVideoButton = document.getElementById("videoButton");
//SDP Description Buttons
const chatLinkButton = document.getElementById("createLink");
const sdpOfferLink = document.getElementById("sdpOfferLink");
const copy = document.getElementById("copy");
const menu = document.getElementById("menu");
const dashboard = document.getElementById("dashboard");
const controls = document.getElementById("controls");
const app = document.getElementById("app");
const closeChat = document.getElementById("closeChat");
async function generateRoomId() {
  chatLinkButton.innerText = "Creating...";
  console.log("creating Room link");
  const link = await createRoomId();
  sdpOfferLink.value = link;
  chatLinkButton.innerText = "Create Chat Link";
}
function showAlert(message,seconds=2,bgColor="black") {
  var infoMsg = document.getElementById('infoMsg');
  infoMsg.style.backgroundColor = bgColor
  clearTimeout();
  infoMsg.innerText = ""
  infoMsg.innerText = message;
  infoMsg.classList.remove('hidden');
  setTimeout(function () {
    infoMsg.classList.add('hidden');
    infoMsg.innerText = ''
  }, 1000*seconds); 
}
if (roomId) {
  menu.classList.add("hidden");
  controls.classList.remove("hidden");
  app.classList.remove("hidden");
  async function isCaller() {
    const currentUser = await loginAnonymous();
    const userUid = await currentUser.uid;
    const data = await getSignal(roomId);
    const isMe = (await data.data().callerId) === userUid;
    return isMe;
  }
  function getRoom() {
    return new Promise(async (resolve, reject) => {
      try {
        const currentUser = await loginAnonymous();
        const doc = await getSignal(roomId);
        resolve(doc.data());
      } catch (error) {
        reject(error);
      }
    });
  }
  // Get user media (for video)
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      // Set up local video
      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = stream;
      let isAudioMuted = false;
      muteAudioButton.addEventListener("click", () => {
        isAudioMuted = !isAudioMuted;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isAudioMuted;
        });
        muteAudioButton.innerHTML = isAudioMuted
          ? '<i class="fa-solid fa-microphone-slash"></i>'
          : '<i class="fa-solid fa-microphone"></i>';
      });

      // Mute/unmute video
      let isVideoMuted = false;
      muteVideoButton.addEventListener("click", () => {
        isVideoMuted = !isVideoMuted;
        stream.getVideoTracks().forEach((track) => {
          track.enabled = !isVideoMuted;
        });
        muteVideoButton.innerHTML = isVideoMuted
          ? '<i class="fa-solid fa-video-slash"></i>'
          : '<i class="fa-solid fa-video"></i>';
      });

      // End the call
      closeChat.addEventListener("click", () => {
        // Close the Peer connection
        peer.destroy();
        // Stop local video stream
        localVideo.srcObject.getTracks().forEach((track) => track.stop());
        // Stop remote video stream (if any)
        const remoteVideo = document.getElementById("remoteVideo");
        if (remoteVideo.srcObject) {
          remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
        }
        window.location.replace(window.location.origin + window.location.pathname)
      });
      // Create a Peer object
      const peer = new Peer();

      // Event handler for when a connection is established
      peer.on("open", async (id) => {
        showAlert("Waiting for Remote Peer connection...",100)
        if (!!(await isCaller())) {
          console.log("My peer ID is: " + id);
          await addLocalId(roomId, id);
        } else {
          await addRemoteId(roomId, id);
        }
        initiateCall();
      });

      // Event handler for incoming connections
      // peer.on("connection", (conn) => {
      //   // Handle data received from the remote peer
      //   conn.on("data", (data) => {
      //     console.log("Received:", data);
      //   });
      // //   conn.on('close', () => {
      // //     console.log('Remote peer disconnected');
      // // });
      // });

      // Event handler for incoming calls
      peer.on("call", (call) => {
        // Answer the call and send our stream
        call.answer(stream);
        showAlert("Connection established!",2,"green")
        // Event handler for when the remote stream is received
        call.on("stream", (remoteStream) => {
          // Set up remote video
          const remoteVideo = document.getElementById("remoteVideo");
          remoteVideo.srcObject = remoteStream;
        });
      });

      // // Connect to a remote peer
      // const conn = peer.connect("remote-peer-id");

      // // Send data to the remote peer
      // conn.send("Hello, remote peer!");

      // Event handler for initiating a call
      async function initiateCall() {
        const roomInfo = await getRoom();
        async function handleSnapshot(snapshot) {
          try {
            if (snapshot.exists()) {
              let remoteCandidate = await snapshot.data().remoteId;
              if (!!remoteCandidate && !!(await isCaller())) {
                // Call the remote peer and send our stream
                const call = peer.call(remoteCandidate, stream);
                call.on("stream", (remoteStream) => {
                  // Set up remote video
                  const remoteVideo = document.getElementById("remoteVideo");
                  remoteVideo.srcObject = remoteStream;
                  showAlert("Connection established!",2,"green")
                });
              }
            }else{
              //RoomId Not Available
              window.location.replace(window.location.origin + window.location.pathname)
            }
          } catch (e) {
            console.log(e.message);
          }
        }
        onGetSignals(roomId, handleSnapshot);
      }
    })
    .catch((error) => {
      console.error("Error accessing media devices:", error);
    });
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
