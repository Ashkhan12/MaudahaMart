const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(
    /\{\(authMode === 'login' \|\| authMode === 'login_otp'\) && \(\n              <motion\.div \n                key="password-field"/,
    `{authMode === 'login' && (\n              <motion.div \n                key="password-field"`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
