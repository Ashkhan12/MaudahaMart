const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');

code = code.replace(/setError\(language === 'en' \? 'Failed to send OTP\. Check phone number format or try again later\.' : 'ओटीपी भेजने में विफल।'\);/g, "setError((language === 'en' ? 'Failed to send OTP: ' : 'ओटीपी भेजने में विफल: ') + (err?.message || ''));");

code = code.replace(/setError\(language === 'en' \? 'Failed to send OTP\.' : 'ओटीपी भेजने में विफल।'\);/g, "setError((language === 'en' ? 'Failed to send OTP: ' : 'ओटीपी भेजने में विफल: ') + (err?.message || ''));");

fs.writeFileSync('src/components/LoginPage.tsx', code);
console.log("File updated successfully");
