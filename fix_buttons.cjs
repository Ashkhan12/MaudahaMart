const fs = require('fs');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const path = dir + '/' + file;
        if (fs.statSync(path).isDirectory()) {
            walkDir(path);
        } else if (path.endsWith('.tsx') || path.endsWith('.ts')) {
            let content = fs.readFileSync(path, 'utf8');
            let originalContent = content;
            
            content = content.replace(/<button([\s\S]*?)className=(['"])(.*?)\2([\s\S]*?)>/g, (match, before, quote, className, after) => {
                if (!className.includes('cursor-pointer') && !className.includes('cursor-not-allowed') && !className.includes('cursor-default')) {
                    return '<button' + before + 'className=' + quote + className + ' cursor-pointer' + quote + after + '>';
                }
                return match;
            });
            
            content = content.replace(/<button(?![^>]*type=)([^>]*)>/g, '<button type="button"$1>');

            if (content !== originalContent) {
                fs.writeFileSync(path, content);
                console.log('Fixed buttons in', path);
            }
        }
    }
}
walkDir('src/components');
