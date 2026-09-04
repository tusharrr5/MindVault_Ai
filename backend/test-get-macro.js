const fs = require('fs');

async function test() {
  try {
    const envLocal = fs.readFileSync('../frontend/.env.local', 'utf8');
    const apiKey = envLocal.match(/NEXT_PUBLIC_FIREBASE_API_KEY=(.*)/)[1];
    
    const email = 'test.user.1@example.com'; 
    const password = 'password123';
    
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const authData = await res.json();
    const idToken = authData.idToken;

    const apiRes = await fetch('http://localhost:8080/journals/insights', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', apiRes.status);
    const data = await apiRes.text();
    console.log('GET /insights Body:', JSON.stringify(JSON.parse(data), null, 2));
    
  } catch (err) {
    console.error(err);
  }
}
test();
