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
  apiKey: "AIzaSyDnIZ0IfeQ8VwQFyXFLMfrRsoqS_WC_ht4",
  authDomain: "real-call.firebaseapp.com",
  projectId: "real-call",
  storageBucket: "real-call.appspot.com",
  messagingSenderId: "64872948580",
  appId: "1:64872948580:web:789f18dfab9e2abb58d071",
  measurementId: "G-GXE40EG2GL"
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
        localId:null,
        remoteId: null,
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

export const addRemoteId = async (id, remoteId=null) =>{
    const user = await loginAnonymous();
    await updateDoc(doc(db, collectionName, id), {remoteId,calleeId:user.uid});
}
export const addLocalId = async (id, localId) =>{
    return await updateDoc(doc(db, collectionName, id), {localId});
}

export const resetRoom = async (id)=>{
  return await updateDoc(doc(db, collectionName,id), {calleeId:null,remoteId:null});
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