import fs from 'fs';

async function runTest() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = envContent.split('\n').find(line => line.startsWith('NEXT_PUBLIC_FIREBASE_API_KEY='));
  if (!apiKeyLine) throw new Error('API Key not found');
  const apiKey = apiKeyLine.split('=')[1].trim();

  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log('1. Signing up test user...');
  const signupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  const signupData = await signupRes.json();
  if (signupData.error) {
    console.error('Signup Error:', signupData.error.message);
    process.exit(1);
  }

  const idToken = signupData.idToken;
  console.log(`2. Successfully obtained ID Token for UID: ${signupData.localId}`);

  console.log('3. Calling backend POST /journals with Bearer token...');
  const createJournalRes = await fetch('http://localhost:8080/journals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'My First AI Journal',
      content: 'This is a test entry.'
    })
  });

  const createJournalData = await createJournalRes.json();
  console.log('4. Backend POST /journals Response:', JSON.stringify(createJournalData));
  if (createJournalData.error) {
    console.error('Test Failed! Backend failed to create journal.');
    process.exit(1);
  }

  console.log('5. Calling backend GET /journals...');
  const getJournalsRes = await fetch('http://localhost:8080/journals', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });

  const getJournalsData = await getJournalsRes.json();
  console.log('6. Backend GET /journals Response:', getJournalsData.data.length, 'journals found.');

  if (getJournalsData.error || getJournalsData.data.length === 0) {
    console.error('Test Failed! Could not retrieve the created journal.');
    process.exit(1);
  }

  const firstJournalId = getJournalsData.data[0].id;
  
  console.log(`7. Calling backend POST /journals/${firstJournalId}/analyze...`);
  const analyzeRes = await fetch(`http://localhost:8080/journals/${firstJournalId}/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });

  const analyzeData = await analyzeRes.json();
  console.log('8. AI Analysis Response:', JSON.stringify(analyzeData, null, 2));

  if (analyzeData.error) {
    console.error('Test Failed! AI analysis failed.');
    process.exit(1);
  } else {
    console.log('Test Passed! Complete E2E Journal CRUD & AI Analysis succeeded.');
  }
}

runTest().catch(console.error);
