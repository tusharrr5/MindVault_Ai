async function test() {
  try {
    const apiRes = await fetch('http://localhost:8080/goals/insight', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer TEST`,
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
