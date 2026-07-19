const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(
    /authMode === 'login'/g,
    `(authMode === 'login' || authMode === 'login_otp')`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
