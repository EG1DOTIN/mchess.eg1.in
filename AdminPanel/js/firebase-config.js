// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCr3D3WnaYtmgoaFIeYgF2cJjZaL-Ap798",
  authDomain: "mchess-9686d.firebaseapp.com",
  projectId: "mchess-9686d",
  storageBucket: "mchess-9686d.firebasestorage.app",
  messagingSenderId: "424666867149",
  appId: "1:424666867149:web:f364cef2727cf37b261084",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const analytics = firebase.analytics();

console.log('Firebase initialized successfully');
