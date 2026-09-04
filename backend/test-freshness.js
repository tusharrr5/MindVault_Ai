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

    // Fetch macro and count
    const [macroRes, countRes] = await Promise.all([
      fetch('http://localhost:8080/journals/insights', { headers: { 'Authorization': `Bearer ${idToken}` } }),
      fetch('http://localhost:8080/journals/count', { headers: { 'Authorization': `Bearer ${idToken}` } })
    ]);

    const macroData = await macroRes.json();
    const countData = await countRes.json();

    console.log('Macro totalEntries:', macroData.data.totalEntries);
    console.log('Current count:', countData.data.count);

    // Add 1 journal
    await fetch('http://localhost:8080/journals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: "Test Entry",
        content: "Testing freshness detection.",
        date: new Date().toISOString()
      })
    });
    console.log("Added 1 new journal.");

    // Fetch count again
    const countRes2 = await fetch('http://localhost:8080/journals/count', { headers: { 'Authorization': `Bearer ${idToken}` } });
    const countData2 = await countRes2.json();

    const isStale = countData2.data.count > macroData.data.totalEntries;
    console.log('New Current count:', countData2.data.count);
    console.log('Is Stale?', isStale);
    
    if (isStale) {
      console.log("Updating analysis...");
      const updateRes = await fetch('http://localhost:8080/journals/insights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      const updateData = await updateRes.json();
      console.log('Updated Macro totalEntries:', updateData.data.totalEntries);
    }
  } catch (err) {
    console.error(err);
  }
}
test();
