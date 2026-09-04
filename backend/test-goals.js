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

    // Create Goal
    let apiRes = await fetch('http://localhost:8080/goals', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Read a book', description: 'Read 1 book a week', category: 'Personal' })
    });
    let data = await apiRes.json();
    console.log('Create:', data.status, data.data?.title);
    const goalId = data.data.id;

    // List Goals
    apiRes = await fetch('http://localhost:8080/goals', { headers: { 'Authorization': `Bearer ${idToken}` } });
    data = await apiRes.json();
    console.log('List count:', data.data.length);

    // Update Goal (Progress)
    apiRes = await fetch(`http://localhost:8080/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: 50 })
    });
    data = await apiRes.json();
    console.log('Update progress:', data.data?.progress);

    // Complete Goal
    apiRes = await fetch(`http://localhost:8080/goals/${goalId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' }
    });
    data = await apiRes.json();
    console.log('Complete:', data.data?.status);

    // Delete Goal
    apiRes = await fetch(`http://localhost:8080/goals/${goalId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    data = await apiRes.json();
    console.log('Delete status:', data.status);

  } catch (err) {
    console.error(err);
  }
}
test();
