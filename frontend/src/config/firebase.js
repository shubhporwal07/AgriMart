import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Gupta Mart Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBI6lvnetMIOHED-kUWvokIqXqDoKm83Ac",
  authDomain: "autotype-1d493.firebaseapp.com",
  databaseURL: "https://autotype-1d493-default-rtdb.firebaseio.com",
  projectId: "autotype-1d493",
  storageBucket: "autotype-1d493.firebasestorage.app",
  messagingSenderId: "171418476986",
  appId: "1:171418476986:web:06d5fa10aea9e02c57fd83",
  measurementId: "G-8DN88C22ZJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;
