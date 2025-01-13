// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "yoman-f07f2.firebaseapp.com",
  projectId: "yoman-f07f2",
  storageBucket: "yoman-f07f2.firebasestorage.app",
  messagingSenderId: "84167712523",
  appId: "1:84167712523:web:9159c8ec5ca8f253548c0e"
};

const app = initializeApp(firebaseConfig);
console.log("App initialized");
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
console.log("Auth initialized");
export const db = getFirestore(app);
console.log("Firestore initialized");

export default app;
