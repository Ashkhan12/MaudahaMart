const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(
    /          if \(\!matchedUser\) \{\n            const newUser: RegisteredUser/g,
    `          if (!matchedUser && authMode === 'signup') {\n            const newUser: RegisteredUser`
);

code = code.replace(
    /          setSuccessMsg\(t.signupSuccess\);\n          setTimeout\(\(\) => \{/g,
    `          setSuccessMsg(authMode === 'login_otp' ? t.loginSuccess : t.signupSuccess);\n          setTimeout(() => {`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
