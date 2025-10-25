// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"

import { getFirestore } from "firebase/firestore"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAOvnvPY6h1jjHkTsbOBZdiRmJIs9Ot2A",
  authDomain: "week7-weifeng.firebaseapp.com",
  projectId: "week7-weifeng",
  storageBucket: "week7-weifeng.appspot.com", 
  messagingSenderId: "504670832668",
  appId: "1:504670832668:web:f12b081d8858914655b7d9"
};

// Initialize Firebase
initializeApp(firebaseConfig)

const db = getFirestore()
export default db