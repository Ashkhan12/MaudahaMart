const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* UserProfile Header Trigger \*\/\}\}/s;

if (regex.test(code)) {
    console.log("Matched the extra brace");
    
    code = code.replace(regex, '{/* UserProfile Header Trigger */}');
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("File updated successfully");
} else {
    console.log("Could not match the extra brace");
}
