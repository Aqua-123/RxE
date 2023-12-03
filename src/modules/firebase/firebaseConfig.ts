import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGnKKjSa9vkFOMnX6oudluAG51f0w9QMA",
  authDomain: "ritsu-x-emerald.firebaseapp.com",
  projectId: "ritsu-x-emerald",
  storageBucket: "ritsu-x-emerald.appspot.com",
  messagingSenderId: "992558791324",
  appId: "1:992558791324:web:6ce6087a25fe0314044b59",
  measurementId: "G-GNE8SZ5ENT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
