const fs = require('fs');
let code = fs.readFileSync('src/routes/goal.routes.ts', 'utf8');

code = code.replace("required: ['title', 'description', 'category', 'priority']", "");
fs.writeFileSync('src/routes/goal.routes.ts', code);
console.log('Removed inner required');
