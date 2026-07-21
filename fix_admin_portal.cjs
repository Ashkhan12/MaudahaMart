const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
  '<ServiceAreaManager />',
  '<ServiceAreaManager areas={props.serviceAreas} onUpdateAreas={props.onUpdateServiceAreas} />'
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log('Fixed AdminPortal.tsx');
