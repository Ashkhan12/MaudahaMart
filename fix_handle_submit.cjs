const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

// Fix the validation
code = code.replace(
    /if \(\!phone \|\| \(\(authMode === 'login' \|\| authMode === 'login_otp'\) && \!password\) \|\| \(authMode === 'signup' && \!name\)\) \{/,
    `if (!phone || (authMode === 'login' && !password) || (authMode === 'signup' && !name)) {`
);

// Fix the logic routing
code = code.replace(
    /if \(\(authMode === 'login' \|\| authMode === 'login_otp'\)\) \{\n      \/\/ --- LOGIN LOGIC ---/,
    `if (authMode === 'login') {\n      // --- LOGIN LOGIC ---`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
