const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: false }));
app.get('/', (req, res) => res.send('ok'));
const server = app.listen(8082, async () => {
  const { execSync } = require('child_process');
  try {
    const res = execSync('curl -s -i -H "Origin: https://malicious-site.com" http://localhost:8082/').toString();
    console.log(res);
  } finally {
    server.close();
  }
});
