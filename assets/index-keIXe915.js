import{initializeApp as U}from"https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";import{getFirestore as M,doc as m,onSnapshot as x,updateDoc as h,addDoc as J,collection as P,getDoc as V}from"https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";import{getAuth as G,signInAnonymously as j}from"https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const p of r.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&i(p)}).observe(document,{childList:!0,subtree:!0});function e(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=e(n);fetch(n.href,r)}})();const F={apiKey:"AIzaSyDnIZ0IfeQ8VwQFyXFLMfrRsoqS_WC_ht4",authDomain:"real-call.firebaseapp.com",projectId:"real-call",storageBucket:"real-call.appspot.com",messagingSenderId:"64872948580",appId:"1:64872948580:web:789f18dfab9e2abb58d071",measurementId:"G-GXE40EG2GL"},K=U(F),l=M(),u="signals",$=async()=>{const o=await y(),e=(await J(P(l,u),{callerId:o.uid,offer:null,answer:null,calleeId:null})).id;return document.location.href+"?room="+e},q=(o,a)=>{const e=m(l,u,o);return x(e,a)},D=async o=>await V(m(l,u,o)),z=async(o,a=null)=>{const e=await y();await h(m(l,u,o),{answer:a,calleeId:e.uid})},H=async(o,a)=>await h(m(l,u,o),{offer:a}),Q=async(o,a)=>await h(m(l,u,o),{candidate:a}),X=async o=>await h(m(l,u,o),{answer:null,calleeId:null,offer:null}),y=async()=>{const o=G(K);try{return(await j(o)).user}catch(a){throw console.error("Anonymous authentication failed:",a.message),a}},d=new URLSearchParams(document.location.search).get("room"),S=document.getElementById("createLink"),C=document.getElementById("sdpOfferLink"),R=document.getElementById("copy"),v=document.getElementById("menu"),_=document.getElementById("dashboard"),W=document.getElementById("controls"),Z=document.getElementById("app"),Y=document.getElementById("closeChat");async function ee(){S.innerText="Creating...",console.log("creating Room link");const o=await $();C.value=o,S.innerText="Create Chat Link"}if(d){v.classList.add("hidden"),W.classList.remove("hidden"),Z.classList.remove("hidden");const o={};async function a(){const c=await(await fetch("https://realbrain.metered.live/api/v1/turn/credentials?apiKey=ff29501ba025c8ffea1ec276bffc4f8dd96f")).json();o.iceServers=c}a();const e=new RTCPeerConnection(o);let i,n;const r=document.getElementById("localVideo"),p=document.getElementById("remoteVideo"),O=document.getElementById("muteButton"),E=document.getElementById("videoButton"),B={video:!0,audio:{echoCancellation:!0,noiseSuppression:!0}};let g=!0,I=!0;async function w(){const c=await(await y()).uid;return await(await D(d)).data().callerId===c}async function k(){return await(await y()).uid,(await D(d)).data()}async function A(){i=await navigator.mediaDevices.getUserMedia(B),n=new MediaStream,r.srcObject=i,p.srcObject=n,i.getTracks().forEach(t=>{e.addTrack(t,i)}),e.ontrack=t=>{t.streams[0].getTracks().forEach(c=>{n.addTrack(c)})},O.onclick=()=>{i.getAudioTracks().forEach(t=>{t.enabled=!g}),g=!g,O.innerHTML=g?'<i class="fa-solid fa-microphone"></i>':'<i class="fa-solid fa-microphone-slash"></i>'},E.onclick=()=>{i.getVideoTracks().forEach(t=>{t.enabled=I=!I}),E.innerHTML=I?'<i class="fa-solid fa-video"></i>':'<i class="fa-solid fa-video-slash"></i>'},Y.onclick=()=>{var t=window.location.href,c=t.split("?")[0];window.location.href=c}}async function T(){try{if(await w()){e.onicecandidate=async s=>{s.candidate&&(await Q(d,JSON.stringify(s.candidate)),console.log(`New Ice Candidate ${JSON.stringify(s.candidate)}`))};const t=await e.createOffer();await e.setLocalDescription(t);const c=JSON.stringify(e.localDescription);await H(d,c),console.log(c)}}catch(t){console.error("Error creating or setting local description:",t)}}async function L(){if(!await w()){console.log("creating SDP answer");const c=await(await k()).offer;if(c&&!e.currentRemoteDescription){e.onicecandidate=async N=>{if(N.candidate){const b=JSON.stringify(e.localDescription);await z(d,b),console.log(b)}};const s=new RTCSessionDescription(JSON.parse(c));await e.setRemoteDescription(s);const f=await e.createAnswer();await e.setLocalDescription(f)}}}A(),setTimeout(async()=>{T(),L(),q(d,async t=>{if(t.exists()){let c=await t.data().answer;if(c&&await w()&&!e.currentRemoteDescription){const f=new RTCSessionDescription(JSON.parse(c));await e.setRemoteDescription(f),console.log(c)}else L();let s=await t.data().candidate;if(s!==void 0&&e.currentRemoteDescription&&!await w()&&e){console.log("IceCandidate Added");const f=JSON.parse(s);e.addIceCandidate(new RTCIceCandidate(f))}}else console.log(`Document with roomId ${d} does not exist.`)})},200),window.addEventListener("beforeunload",async t=>{e.close(),await X(d)})}else S.onclick=ee,v.onclick=()=>{_.classList.toggle("hidden")},R.onclick=()=>{C.select(),C.setSelectionRange(0,99999),document.execCommand("copy"),R.innerText="Copied"},console.log("Room not exist");
