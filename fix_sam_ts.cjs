const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceAreaManager.tsx', 'utf8');

// add cancellation_rate: 0, delivery_slots: [], delivery_types: []
code = code.replace(
  "average_delivery_time: 'N/A'",
  "average_delivery_time: 'N/A',\n      cancellation_rate: 0,\n      delivery_slots: [],\n      delivery_types: []"
);

// fix area.name -> area.area_name
code = code.replace(/area\.name/g, "area.area_name");

// fix area.radius -> area.max_distance_km + 'km'
code = code.replace(/area\.radius/g, "area.max_distance_km + 'km'");

fs.writeFileSync('src/components/ServiceAreaManager.tsx', code);
console.log('Fixed TS errors in ServiceAreaManager');
