require('dotenv').config({ path: '.env' });
const admin = require('firebase-admin');
const fetch = require('node-fetch');

const serviceAccount = require('./serviceAccountKey.json'); // assuming this exists, or use default

async function run() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();
  const users = await db.collection('users').limit(1).get();
  if (users.empty) return console.log('No users found.');
  const uid = users.docs[0].id;
  
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    // Exchange custom token for ID token using Firebase Identity Toolkit API
    // Need API key for this... which is tricky without the web API key.
    console.log("Got custom token for UID:", uid);
  } catch (err) {
    console.error(err);
  }
}
// run();
