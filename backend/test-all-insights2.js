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
    console.log("Got ID token");

    // Add journal 1
    await fetch('http://localhost:8080/journals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: "Good Day",
        content: "I had a really good day today. I accomplished all my goals and felt very productive and happy.",
        date: new Date().toISOString()
      })
    });
    
    // Add journal 2
    await fetch('http://localhost:8080/journals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: "Stressful Afternoon",
        content: "Things got a bit overwhelming at work. Too many meetings and tight deadlines.",
        date: new Date().toISOString()
      })
    });

    console.log("Added journals. Analyzing...");

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
