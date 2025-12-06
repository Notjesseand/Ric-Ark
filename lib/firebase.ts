import { initializeApp } from "firebase/app";
import firebase from "firebase/app";
import "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import getStorage instead of storage

const firebaseConfig = {
  apiKey: "AIzaSyC1Fy4-z-pp41p3g-8ll1duGXV7NYtahzk",
  authDomain: "yield-cc374.firebaseapp.com",
  projectId: "yield-cc374",
  storageBucket: "yield-cc374.firebasestorage.app",
  messagingSenderId: "653338684337",
  appId: "1:653338684337:web:78f2d42dfcf303de4b6b90",
  measurementId: "G-GK34E19K1J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize storag

export { app, auth, db, storage };

// import { initializeApp } from "firebase/app";
// import firebase from "firebase/app";
// import "firebase/database";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage"; // Import getStorage instead of storage

// const firebaseConfig = {
//   apiKey: "AIzaSyDMCy6VPG1YqOAj25abtx7hiP4lj_hs-ak",
//   authDomain: "yield-6f99c.firebaseapp.com",
//   projectId: "yield-6f99c",
//   storageBucket: "yield-6f99c.firebasestorage.app",
//   messagingSenderId: "944176572423",
//   appId: "1:944176572423:web:cb74a0c5b9f867b69d22a2",
//   measurementId: "G-3B50B50LVS",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app); // Initialize storag

// export { app, auth, db, storage };
