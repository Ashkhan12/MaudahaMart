const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(
    /onClick=\{\(\) => setAuthMode\(authMode === 'login' \? 'login_otp' : 'login'\)\}/,
    `onClick={() => {
                    setAuthMode(authMode === 'login' ? 'login_otp' : 'login');
                    setError('');
                    setSuccessMsg('');
                    setOtpSent(false);
                  }}`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
