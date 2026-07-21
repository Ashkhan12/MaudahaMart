const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const searchRegex = /app\.post\('\/api\/ai-search', async \(req, res\) => \{[\s\S]*?try \{[\s\S]*?const \{ query, language \} = req\.body;[\s\S]*?const simplifiedCatalog = INITIAL_PRODUCTS\.map\(p => \(\{/m;
const searchReplace = `app.post('/api/ai-search', async (req, res) => {
  try {
    const { query, language, allProducts } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    if (!apiKey) {
      return res.json({
        explanation: "Maudaha AI Search is currently offline. Please configure your GEMINI_API_KEY in Secrets to enable semantic search!",
        explanationHi: "मौदहा एआई सर्च वर्तमान में ऑफलाइन है। सिमेंटिक सर्च को सक्षम करने के लिए कृपया सीक्रेट्स में अपना GEMINI_API_KEY कॉन्फ़िगर करें!",
        recommendedProductIds: [],
        offline: true
      });
    }

    const catalogToUse = allProducts || INITIAL_PRODUCTS;
    const simplifiedCatalog = catalogToUse.map((p: any) => ({`;

code = code.replace(searchRegex, searchReplace);

fs.writeFileSync('server.ts', code);
