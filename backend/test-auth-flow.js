const fs = require('fs');

async function test() {
  try {
    // 1. Get API key
    const envLocal = fs.readFileSync('../frontend/.env.local', 'utf8');
    const apiKey = envLocal.match(/NEXT_PUBLIC_FIREBASE_API_KEY=(.*)/)[1];
    
    // 2. Login to get real ID token using Firebase REST API
    // Need a real user. Let's create one or login.
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.user.' + Date.now() + '@example.com', password: 'password123', returnSecureToken: true })
    });
    
    const authData = await res.json();
    if (!authData.idToken) {
      console.error("Failed to sign up:", authData);
      return;
    }
    const idToken = authData.idToken;
    console.log("Got real ID token. Hitting backend...");

    // 3. Hit backend
    const apiRes = await fetch('http://localhost:8080/journals', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', apiRes.status);
    const data = await apiRes.text();
    console.log('Body:', data);
    
  } catch (err) {
    console.error(err);
  }
}
test();
