const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

// Fix 680
code = code.replace(
    /onClick=\{\(\) => setAuthMode\(\(authMode === 'login' \|\| authMode === 'login_otp'\) \? 'login_otp' : 'login'\)\}/,
    `onClick={() => setAuthMode(authMode === 'login' ? 'login_otp' : 'login')}`
);

// Fix 683
code = code.replace(
    /\{\(authMode === 'login' \|\| authMode === 'login_otp'\) \n                    \? \(language === 'en' \? 'Login with OTP instead' : 'ओटीपी के साथ लॉगिन करें'\) \n                    : \(language === 'en' \? 'Login with Password instead' : 'पासवर्ड के साथ लॉगिन करें'\)\}/,
    `{authMode === 'login' 
                    ? (language === 'en' ? 'Login with OTP instead' : 'ओटीपी के साथ लॉगिन करें') 
                    : (language === 'en' ? 'Login with Password instead' : 'पासवर्ड के साथ लॉगिन करें')}`
);

// Fix 704
code = code.replace(
    /<span>\{\(authMode === 'login' \|\| authMode === 'login_otp'\) \? t\.login : \(\!otpSent \? t\.sendOtpBtn : t\.verifyBtn\)\}<\/span>/,
    `<span>{authMode === 'login' ? t.login : (!otpSent ? t.sendOtpBtn : t.verifyBtn)}</span>`
);

// Fix 619
code = code.replace(
    /\{\(authMode === 'login' \|\| authMode === 'login_otp'\) && \(/,
    `{authMode === 'login' && (`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
