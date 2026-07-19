const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

// Conditionally render password field
code = code.replace(
    /\{\/\* Password field \*\/\}\s*<div className="space-y-1\.5">/g,
    `{/* Password field */}
          <AnimatePresence>
            {authMode === 'login' && (
              <motion.div 
                key="password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 overflow-hidden"
              >`
);

code = code.replace(
    /                disabled=\{loading\}\n              \/>\n            <\/div>\n          <\/div>/g,
    `                disabled={loading}
              />
            </div>
          </motion.div>
          )}
          </AnimatePresence>`
);

code = code.replace(
    /disabled=\{loading \|\| \(authMode === 'signup' && otpSent\)\}/g,
    `disabled={loading || ((authMode === 'signup' || authMode === 'login_otp') && otpSent)}`
);

code = code.replace(
    /\{authMode === 'signup' && otpSent && \(/g,
    `{(authMode === 'signup' || authMode === 'login_otp') && otpSent && (`
);

fs.writeFileSync('src/components/LoginPage.tsx', code);
