const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBI6lvnetMIOHED-kUWvokIqXqDoKm83Ac",
  authDomain: "autotype-1d493.firebaseapp.com",
  databaseURL: "https://autotype-1d493-default-rtdb.firebaseio.com",
  projectId: "autotype-1d493",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function inspect() {
  const currentSnap = await get(ref(db, 'announcements/current'));
  console.log('Current Announcement:', JSON.stringify(currentSnap.val(), null, 2));

  const seenSnap = await get(ref(db, 'announcements/seen'));
  console.log('Seen state in RTDB:', JSON.stringify(seenSnap.val(), null, 2));
}

inspect().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
