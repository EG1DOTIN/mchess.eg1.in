/**
 * @file firebase-config.js
 * @description Initializes Firebase Web App SDK and Cloud Firestore service instance for MCHESS client application.
 * @project MCHESS Interactive Chess Portal
 */

// Firebase Configuration Object for Public Client Web App
// Note: Public Firebase API keys are safe to expose when Cloud Firestore Security Rules are enabled.
const firebaseConfig = {
  apiKey: "AIzaSyCr3D3WnaYtmgoaFIeYgF2cJjZaL-Ap798",
  authDomain: "mchess-9686d.firebaseapp.com",
  projectId: "mchess-9686d",
  storageBucket: "mchess-9686d.firebasestorage.app",
  messagingSenderId: "424666867149",
  appId: "1:424666867149:web:faebb85a29bb60b5261084"
};

// Initialize main Firebase instance
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore database instance for client queries
const db = firebase.firestore();

console.log('Firebase initialized on MCHESS App');
