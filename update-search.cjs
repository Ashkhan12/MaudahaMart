const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerPortal.tsx', 'utf8');

code = code.replace(/body: JSON.stringify\(\{ query, language \}\)/g, 
"body: JSON.stringify({ query, language, allProducts: products })");

code = code.replace(/body: JSON.stringify\(\{ query: trimmed, language \}\)/g, 
"body: JSON.stringify({ query: trimmed, language, allProducts: products })");

fs.writeFileSync('src/components/CustomerPortal.tsx', code);
