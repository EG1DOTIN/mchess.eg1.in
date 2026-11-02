import { FirebaseAppConfig } from 'eg-web-core';

/**
 * Site-specific Firebase credentials for mchess.eg1.in portal.
 */
export const MCHESS_FIREBASE_CONFIG: FirebaseAppConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || 'AIzaSyCr3D3WnaYtmgoaFIeYgF2cJjZaL-Ap798',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'mchess-9686d.firebaseapp.com',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'mchess-9686d',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'mchess-9686d.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '424666867149',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || '1:424666867149:web:faebb85a29bb60b5261084',
};
