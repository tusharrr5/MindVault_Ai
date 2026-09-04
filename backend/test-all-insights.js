const fs = require('fs');

async function test() {
  try {
    const envLocal = fs.readFileSync('../frontend/.env.local', 'utf8');
    const apiKey = envLocal.match(/NEXT_PUBLIC_FIREBASE_API_KEY=(.*)/)[1];
    
    // Login to get a real token (using my test user from earlier or create a new one)
    const email = 'test.user.1@example.com'; 
    const password = 'password123';
    
    let res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    let authData = await res.json();
    if (authData.error) {
      console.log("Failed to login, trying signup...");
      res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      authData = await res.json();
    }
    
    const idToken = authData.idToken;
    console.log("Got ID token for", email);

    // Call Analyze All Journals endpoint
    const apiRes = await fetch('http://localhost:8080/journals/insights', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', apiRes.status);
    const data = await apiRes.text();
    console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
    
  } catch (err) {
    console.error(err);
  }
}
test();
