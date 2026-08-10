// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDto-V_JFxgUqdeBHgN_V-MeFs8p02F-8c",
  authDomain: "gestao-4de5e.firebaseapp.com",
  projectId: "gestao-4de5e",
  storageBucket: "gestao-4de5e.firebasestorage.app",
  messagingSenderId: "544741745971",
  appId: "1:544741745971:web:3dac4d54d6d9175db74a46",
  measurementId: "G-QXC4VC1LL5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
