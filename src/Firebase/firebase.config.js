// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD82ytrEbV77besQut0FQUUjJTI7njZmAE",
  authDomain: "just-edge.firebaseapp.com",
  projectId: "just-edge",
  storageBucket: "just-edge.appspot.com",
  messagingSenderId: "511374083324",
  appId: "1:511374083324:web:99e4ef2ec9f48ddc820379"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;