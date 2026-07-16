import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBx7CRD5DKuydNQZuLYdtW3J3eaduZ4pbM",
  authDomain: "rich-window-499114-e2.firebaseapp.com",
  projectId: "rich-window-499114-e2",
  storageBucket: "rich-window-499114-e2.firebasestorage.app",
  messagingSenderId: "40655015827",
  appId: "1:40655015827:web:450942dae566746186a266"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-e528ea87-6ff9-4c97-8059-3ca0c074dec1");

async function run() {
  const docRef = doc(db, "settings", "config");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Current document settings:", snap.data());
    await updateDoc(docRef, { adminPin: "devxdevx" });
    console.log("Success! Updated adminPin to 'devxdevx'.");
  } else {
    console.log("Error: settings/config doc does not exist.");
  }
}

run().catch(console.error);
