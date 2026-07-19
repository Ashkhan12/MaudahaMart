const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(
    /\{authMode === 'login' && \(\n              <motion\.span\n                layoutId="authModeActive"/,
    `{(authMode === 'login' || authMode === 'login_otp') && (\n              <motion.span\n                layoutId="authModeActive"`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
