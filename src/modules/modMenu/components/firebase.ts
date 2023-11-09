import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Initialize Firebase with the provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyB4uXdUj6n98IGyRwu8qgKBwGYPau4VN8M",
  authDomain: "name-mod-api-2.firebaseapp.com",
  projectId: "name-mod-api-2",
  storageBucket: "name-mod-api-2.appspot.com",
  messagingSenderId: "66911516509",
  appId: "1:66911516509:web:ed281f81cfdd6b4b145ab4",
  measurementId: "G-LSKDYQLBQY"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

interface ModerationData {
  picture?: string;
  nameModeration?: string;
  action: string;
}

export async function sendDataToFirestore(data: {
  action: string;
  pictureBase64?: string;
  nameModeration?: string;
}) {
  const { action, pictureBase64, nameModeration } = data;
  // Reference to your Firestore collection
  const dataJson: ModerationData = {
    action
  };
  if (pictureBase64) dataJson.picture = pictureBase64;
  if (nameModeration) dataJson.nameModeration = nameModeration;
  try {
    const collectionRef = await addDoc(collection(db, "EmeraldChat"), dataJson);
    console.log("Document written with ID: ", collectionRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
