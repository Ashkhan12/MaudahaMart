const fs = require('fs');
let sam = fs.readFileSync('src/components/ServiceAreaManager.tsx', 'utf8');

const oldUseEffect = /useEffect\(\(\) => \{[\s\S]*?\}, \[selectedArea, activeTab, allUsers, allStores, allProducts, allOrders, allTickets\]\);/m;
const newUseEffect = `useEffect(() => {
    if (selectedArea) {
      if (activeTab === 'users') {
        const areaUsers = (allUsers || []).filter(u => u.serviceAreaId === selectedArea.id || u.location === selectedArea.city);
        setUsers(areaUsers);
      } else if (activeTab === 'vendors') {
        const areaVendors = (allStores || []).filter(v => v.area === selectedArea.id || v.city === selectedArea.city);
        setVendors(areaVendors);
      } else if (activeTab === 'catalog') {
        const areaVendors = (allStores || []).filter(v => v.area === selectedArea.id || v.city === selectedArea.city);
        const storeIds = areaVendors.map(v => v.id);
        const areaProducts = (allProducts || []).filter(p => storeIds.includes(p.storeId));
        setProductsStats({ total: areaProducts.length, message: "Items Available" });
        
        const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea.id);
        const activeOrders = areaOrders.filter(o => ['pending', 'processing', 'out_for_delivery'].includes(o.deliveryStatus));
        setOrdersStats({ totalActive: activeOrders.length, message: "Active Orders Right Now" });
      } else if (activeTab === 'delivery') {
        const activeRiders = (allUsers || []).filter(u => u.role === 'delivery' && (u.serviceAreaId === selectedArea.id || u.location === selectedArea.city));
        setDeliveryPartners({ online: activeRiders.length, message: "Boys Online" });
      } else if (activeTab === 'marketing') {
        setCoupons([{ code: 'WELCOME100' }]);
        const areaTickets = (allTickets || []).filter(t => t.serviceAreaId === selectedArea.id || t.status === 'open');
        setTickets(areaTickets);
      }
    }
  }, [selectedArea, activeTab, allUsers, allStores, allProducts, allOrders, allTickets]);`;

sam = sam.replace(oldUseEffect, newUseEffect);
fs.writeFileSync('src/components/ServiceAreaManager.tsx', sam);
