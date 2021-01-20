import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAS2J78qR7XZCHwctXU6zepPz7L0LZ1Nts",
  authDomain: "todos-ffc9f.firebaseapp.com",
  projectId: "todos-ffc9f",
  storageBucket: "todos-ffc9f.appspot.com",
  messagingSenderId: "485881050351",
  appId: "1:485881050351:web:64e82f4a2a57549607971a",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const firebaseInstance = firebase;

export const authService = firebase.auth();
export const dbService = firebase.firestore();
export const storageService = firebase.storage();
