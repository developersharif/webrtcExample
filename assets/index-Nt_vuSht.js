(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))f(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&f(a)}).observe(document,{childList:!0,subtree:!0});function i(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function f(t){if(t.ep)return;t.ep=!0;const r=i(t);fetch(t.href,r)}})();const p={};async function w(){const o=await(await fetch("https://realbrain.metered.live/api/v1/turn/credentials?apiKey=ff29501ba025c8ffea1ec276bffc4f8dd96f")).json();p.iceServers=o}w();const n=new RTCPeerConnection(p);let c,d;const h=document.getElementById("localVideo"),B=document.getElementById("remoteVideo"),v=document.getElementById("create_offer"),E=document.getElementById("create_answer"),O=document.getElementById("add_answer"),g=document.getElementById("sdp_offer"),y=document.getElementById("sdp_answer"),u=document.getElementById("muteButton"),m=document.getElementById("videoButton"),S=document.getElementById("menu"),b=document.getElementById("dashboard"),I={video:!0,audio:!0};let s=!0,l=!0;D();async function D(){c=await navigator.mediaDevices.getUserMedia(I),d=new MediaStream,h.srcObject=c,B.srcObject=d,c.getTracks().forEach(e=>{n.addTrack(e,c)}),n.ontrack=e=>{e.streams[0].getTracks().forEach(o=>{d.addTrack(o)})}}async function T(){n.onicecandidate=o=>{console.log(o),o.candidate&&(g.value=JSON.stringify(n.localDescription))};const e=await n.createOffer();await n.setLocalDescription(e)}async function L(){const e=g.value,o=new RTCSessionDescription(JSON.parse(e));await n.setRemoteDescription(o);const i=await n.createAnswer();await n.setLocalDescription(i),y.value=JSON.stringify(n.localDescription)}async function A(){if(!n.currentRemoteDescription){const e=new RTCSessionDescription(JSON.parse(y.value));n.setRemoteDescription(e)}}u.onclick=()=>{c.getAudioTracks().forEach(e=>{e.enabled=!s}),s=!s,u.innerHTML=s?'<i class="fa-solid fa-microphone"></i>':'<i class="fa-solid fa-microphone-slash"></i>'};m.onclick=()=>{c.getVideoTracks().forEach(e=>{e.enabled=l=!l}),m.innerHTML=l?'<i class="fa-solid fa-video"></i>':'<i class="fa-solid fa-video-slash"></i>'};S.onclick=()=>{b.classList.toggle("hidden")};v.onclick=T;E.onclick=L;O.onclick=A;