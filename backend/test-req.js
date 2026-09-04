async function run() {
  try {
    const res = await fetch('http://127.0.0.1:8080/goals/insight', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ignore',
        'Content-Type': 'application/json'
      }
    });
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Body:', data);
  } catch (err) {
    console.error(err);
  }
}
run();
