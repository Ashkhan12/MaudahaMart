const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceAreaManager.tsx', 'utf8');

const signature = `export default function ServiceAreaManager({ areas, onUpdateAreas, allUsers, allStores, allProducts, allOrders, allTickets }: { areas: ServiceArea[], onUpdateAreas: (areas: ServiceArea[]) => void, allUsers?: any[], allStores?: any[], allProducts?: any[], allOrders?: any[], allTickets?: any[] }) {`;

code = code.replace(/export default function ServiceAreaManager\([^)]*\)\s*\{/, signature);

// fix cancellation_rate
code = code.replace(
  "average_delivery_time: 'N/A'",
  "average_delivery_time: 'N/A',\n      cancellation_rate: 0,\n      delivery_slots: [],\n      delivery_types: []"
);

fs.writeFileSync('src/components/ServiceAreaManager.tsx', code);
console.log('Fixed SAM props');
