import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";
import { getAuth, signInAnonymously  } from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js'

// Your web app's Firebase configuration
const firebaseConfig = {

};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore();
const collectionName = "signals";
/**
 * Save a New Signal in Firestore
 * @param {string} offer the sdp offer of the peer connection
 * @param {string} answer the sdp answer of the peer connection
 */
export const createRoomId = async () =>{
    const user = await loginAnonymous();
    const docRef = await addDoc(collection(db, collectionName), {
        callerId: user.uid,
        offer:null,
        answer: null,
        calleeId: null,
      });
      const docId = docRef.id;
      const roomUrl = document.location.href + '?room=' + docId;
      return roomUrl;
}

export const onGetSignals = (docId, callback) => {
    const signalDocRef = doc(db, collectionName, docId);
    return onSnapshot(signalDocRef, callback);
  };

export const deleteSignal = (id) => deleteDoc(doc(db, collectionName, id));

export const getSignal = async (id) => await getDoc(doc(db, collectionName, id));

export const addSdpAnswer = async (id, answer=null) =>{
    const user = await loginAnonymous();
    await updateDoc(doc(db, collectionName, id), {answer,calleeId:user.uid});
}
export const createSdpOffer = async (id, offer) =>{
    return await updateDoc(doc(db, collectionName, id), {offer});
}

export const addIceCandidate = async (id,candidate)=>{
  return await updateDoc(doc(db, collectionName,id), {candidate});
}
export const resetRoom = async (id)=>{
  return await updateDoc(doc(db, collectionName,id), {answer:null,calleeId:null,offer:null});
}

export const getSignals = () => getDocs(collection(db, collectionName));

export const loginAnonymous = async () => {
    const auth = getAuth(app);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      return user;
    } catch (error) {
      console.error('Anonymous authentication failed:', error.message);
      throw error;
    }
  };