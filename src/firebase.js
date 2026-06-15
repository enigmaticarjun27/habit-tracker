import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXG6Hz0q7yG3RS6nHrxDXQo_WF2FogZqc",
  authDomain: "habit-tracker-f9cc3.firebaseapp.com",
  projectId: "habit-tracker-f9cc3",
  storageBucket: "habit-tracker-f9cc3.firebasestorage.app",
  messagingSenderId: "235947189987",
  appId: "1:235947189987:web:297a90b5f17c0b93a447d6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
