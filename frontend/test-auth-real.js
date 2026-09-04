const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
    user = cred.user;
  } catch (e) {
    const cred = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
    user = cred.user;
  }
  
  const token = await user.getIdToken();
  
  // Now hit the backend
  const res = await fetch('http://localhost:8080/goals/insight', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Status:', res.status);
  const data = await res.text();
  console.log('Body:', data);
}
test();
