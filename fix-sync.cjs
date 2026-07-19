const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We want to remove all those 15 useEffects and replace them with a unified diff-sync mechanism.
const collections = [
  'stores', 'restaurants', 'boutiques', 'products', 'reviews', 'orders', 
  'notifications', 'users', 'supportTickets', 'settings', 'customPanels', 
  'payoutRequests', 'serviceAreas', 'merchantRequests', 'priceLogs'
];

// First, remove the old ones.
// They look like:
/*
  useEffect(() => {
    if (isDbLoading) return;
    stores.forEach(store => {
      syncDocToFirestore('stores', store.id, store);
    });
  }, [stores, isDbLoading]);
*/
const oldSyncRegex = /useEffect\(\(\) => \{\s*if \(isDbLoading\) return;\s*(?:[a-zA-Z]+\.forEach\([a-zA-Z]+ => \{\s*syncDocToFirestore\('[a-zA-Z]+', [a-zA-Z]+\.id, [a-zA-Z]+\);\s*\}\);|syncDocToFirestore\('settings', 'global', settings\);)\s*\}, \[[a-zA-Z]+, isDbLoading\]\);/g;

const matches = code.match(oldSyncRegex);
console.log('Found old sync useEffects:', matches ? matches.length : 0);

if (matches) {
    code = code.replace(oldSyncRegex, '');
    
    // Insert the new unified hook
    const newHook = `
  // Unified diff-based Firestore sync to prevent quota exhaustion
  const prevStates = useRef<any>({});
  
  useEffect(() => {
    if (isDbLoading) return;
    
    const syncCollection = (name: string, currentArray: any[]) => {
      if (!prevStates.current[name]) {
        prevStates.current[name] = currentArray;
        return;
      }
      
      const prevArray = prevStates.current[name];
      currentArray.forEach(item => {
        const prevItem = prevArray.find((p: any) => p.id === item.id);
        if (JSON.stringify(item) !== JSON.stringify(prevItem)) {
           syncDocToFirestore(name, item.id, item);
        }
      });
      prevStates.current[name] = currentArray;
    };

    syncCollection('stores', stores);
    syncCollection('restaurants', restaurants);
    syncCollection('boutiques', boutiques);
    syncCollection('products', products);
    syncCollection('reviews', reviews);
    syncCollection('orders', orders);
    syncCollection('notifications', notifications);
    syncCollection('users', users);
    syncCollection('supportTickets', supportTickets);
    syncCollection('customPanels', customPanels);
    syncCollection('payoutRequests', payoutRequests);
    syncCollection('serviceAreas', serviceAreas);
    syncCollection('merchantRequests', merchantRequests);
    syncCollection('priceLogs', priceLogs);
    
    // Settings is a single object
    if (!prevStates.current['settings']) {
       prevStates.current['settings'] = settings;
    } else {
       if (JSON.stringify(settings) !== JSON.stringify(prevStates.current['settings'])) {
          syncDocToFirestore('settings', 'global', settings);
          prevStates.current['settings'] = settings;
       }
    }

  }, [
    isDbLoading, stores, restaurants, boutiques, products, reviews, orders, 
    notifications, users, supportTickets, settings, customPanels, 
    payoutRequests, serviceAreas, merchantRequests, priceLogs
  ]);
`;

    // Insert newHook before the first drawer state
    code = code.replace('const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);', newHook + '\n  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);');
    
    // Also we need to import useRef if not imported
    if (!code.includes('useRef')) {
        code = code.replace("import React, { useState, useEffect, useMemo }", "import React, { useState, useEffect, useMemo, useRef }");
    }
    
    fs.writeFileSync('src/App.tsx', code);
    console.log('Successfully replaced with diff-based sync.');
}

