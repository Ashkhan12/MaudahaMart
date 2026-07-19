const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Heart className=\{`h-5 w-5 \$\{activeUser\?\.watchlist\?\.length \? 'fill-rose-500 text-rose-500' : ''\}`\} \/>\s*\{Object\.keys\(cart\)\.filter\([^\n]*\n\s*<\/span>\s*\n\s*\)\}\s*\n\s*<\/button>\s*\n\s*\/\* UserProfile Header Trigger \*\//s;

if (regex.test(code)) {
    console.log("Matched the weird mangled block");
    
    // First, let's restore the Wishlist and Cart buttons
    const restored = `<Heart className={\`h-5 w-5 \${activeUser?.watchlist?.length ? 'fill-rose-500 text-rose-500' : ''}\`} />
              {activeUser?.watchlist && activeUser.watchlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-mono text-[9px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {activeUser.watchlist.length}
                </span>
              )}
            </button>

            {/* Cart Header Trigger */}
            <button
              onClick={() => {
                setDrawerInitialTab('cart');
                setShowWishlistDrawer(true);
              }}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 transition relative cursor-pointer"
              title={language === 'en' ? 'Global Shopping Cart' : 'ग्लोबल शॉपिंग कार्ट'}
            >
              <ShoppingBag className="h-5 w-5" />
              {Object.keys(cart).filter(sId => cart[sId] && cart[sId].length > 0).reduce((sum, sId) => sum + (cart[sId]?.reduce((s, it) => s + it.quantity, 0) || 0), 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white font-mono text-[9px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {Object.keys(cart).filter(sId => cart[sId] && cart[sId].length > 0).reduce((sum, sId) => sum + (cart[sId]?.reduce((s, it) => s + it.quantity, 0) || 0), 0)}
                </span>
              )}
            </button>

            {/* UserProfile Header Trigger */}`;
            
    code = code.replace(regex, restored);
    
    // Now let's remove the Multi-role Hub Switcher block
    const switcherRegex = /\s*\{\/\* Multi-role Hub Switcher \*\/\}\s*<div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">\s*<select[^>]*>.*?<\/select>\s*<\/div>/s;
    if (switcherRegex.test(code)) {
        console.log("Matched the multi-role switcher");
        code = code.replace(switcherRegex, '');
    } else {
        console.log("Did not match multi-role switcher");
    }
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("File updated successfully");
} else {
    console.log("Could not match the weird mangled block");
}
