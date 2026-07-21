const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(/<ServiceAreaManager\s+areas=\{props\.serviceAreas\}\s+onUpdateAreas=\{props\.onUpdateServiceAreas\}\s*\/>/g, 
`<ServiceAreaManager 
        areas={props.serviceAreas} 
        onUpdateAreas={props.onUpdateServiceAreas}
        allUsers={props.users}
        allStores={props.stores}
        allProducts={props.products}
        allOrders={props.orders}
        allTickets={props.supportTickets}
      />`);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
