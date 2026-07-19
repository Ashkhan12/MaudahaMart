const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(
    /<span>\{authMode === 'login' \? t\.login : \(\!otpSent \? t\.sendOtpBtn : t\.verifyBtn\)\}<\/span>/g,
    `<span>{authMode === 'login' ? t.login : (!otpSent ? t.sendOtpBtn : t.verifyBtn)}</span>`
);

// We can add the switcher above the submit button
code = code.replace(
    /          \{\/\* Submit button \*\/\}/g,
    `          {/* Switch Login Method */}
          {authMode !== 'signup' && !otpSent && (
            <div className="flex justify-end px-1 mt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'login_otp' : 'login')}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold transition-colors cursor-pointer"
                >
                  {authMode === 'login' 
                    ? (language === 'en' ? 'Login with OTP instead' : 'ओटीपी के साथ लॉगिन करें') 
                    : (language === 'en' ? 'Login with Password instead' : 'पासवर्ड के साथ लॉगिन करें')}
                </button>
            </div>
          )}
          {/* Submit button */}`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
