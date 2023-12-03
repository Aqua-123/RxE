import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function addToFirebase(
  collectionName: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}
