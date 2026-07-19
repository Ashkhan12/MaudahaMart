const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

// Update useState for authMode
code = code.replace(
    `const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');`,
    `const [authMode, setAuthMode] = useState<'login' | 'signup' | 'login_otp'>('login');`
);

// Update handleSubmit initial validation
code = code.replace(
    `if (!phone || !password || (authMode === 'signup' && !name)) {`,
    `if (!phone || (authMode === 'login' && !password) || (authMode === 'signup' && !name)) {`
);

// Update handleSubmit branch for login vs otp
code = code.replace(
    `if (authMode === 'login') {
      // --- LOGIN LOGIC ---`,
    `if (authMode === 'login') {
      // --- LOGIN LOGIC ---`
);

// Replace "} else {" which was for signup, with "} else {" (for both signup and login_otp, since they share OTP logic)
code = code.replace(
    `    } else {
      // --- SIGNUP LOGIC (Requires OTP) ---`,
    `    } else {
      // --- SIGNUP & LOGIN_OTP LOGIC (Requires OTP) ---
      // Check if user exists first for login_otp
      if (authMode === 'login_otp' && !otpSent) {
          let matchedUser = (existingUsers || []).find(
            u => u.phone && u.phone.replace(/\\D/g, '').endsWith(cleanedPhone.slice(-10))
          );
          if (!matchedUser) {
            setError(t.errorUserNotFound + " " + (language === 'en' ? "Please switch to Sign Up." : "कृपया साइन अप पर जाएं।"));
            return;
          }
      }`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
