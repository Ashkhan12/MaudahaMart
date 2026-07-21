const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceAreaManager.tsx', 'utf8');

// replace the component signature
code = code.replace(
  "export default function ServiceAreaManager() {",
  `import { ServiceArea } from '../types';\n\nexport default function ServiceAreaManager({ areas, onUpdateAreas }: { areas: ServiceArea[], onUpdateAreas: (areas: ServiceArea[]) => void }) {`
);

// remove `const [areas, setAreas] = useState<any[]>([]);`
code = code.replace("const [areas, setAreas] = useState<any[]>([]);", "");

// replace `fetch('/api/admin/service-areas')` logic
code = code.replace(/useEffect\(\(\) => \{\s*fetch\('\/api\/admin\/service-areas'\)\s*\.then\(res => res\.json\(\)\)\s*\.then\(data => \{\s*setAreas\(data\);\s*\}\)\s*\.catch\(err => console\.error\("Error fetching areas", err\)\);\s*\}, \[\]\);/, "");

// handleAddArea
const oldHandleAdd = `  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName) return;
    
    fetch('/api/admin/service-areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAreaName, status: 'Active', radius: '5km' })
    })
    .then(res => res.json())
    .then(newArea => {
      setAreas([...areas, newArea]);
      setNewAreaName('');
      setShowAddModal(false);
    })
    .catch(err => console.error(err));
  };`;

const newHandleAdd = `  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName) return;
    
    const newArea: ServiceArea = {
      id: 'area-' + Date.now(),
      area_name: newAreaName,
      status: 'Active',
      pincode: '',
      city: newAreaName,
      state: '',
      delivery_charge: 0,
      free_delivery_above: 0,
      minimum_order_amount: 0,
      estimated_delivery_time: '30 Mins',
      max_distance_km: 5,
      polygon_coordinates: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_orders: 0,
      monthly_orders: 0,
      active_customers: 0,
      revenue: 0,
      average_delivery_time: 'N/A'
    };
    
    onUpdateAreas([...areas, newArea]);
    setNewAreaName('');
    setShowAddModal(false);
  };`;

code = code.replace(oldHandleAdd, newHandleAdd);

// toggleStatus
const oldToggle = `  const toggleStatus = (id: string) => {
    fetch(\`/api/admin/service-areas/\${id}/status\`, { method: 'PATCH' })
    .then(res => res.json())
    .then(updated => {
      setAreas(areas.map(area => area.id === id ? updated : area));
      if (selectedArea?.id === id) setSelectedArea(updated);
    })
    .catch(err => console.error(err));
  };`;
  
const newToggle = `  const toggleStatus = (id: string) => {
    const updatedAreas = areas.map(area => {
      if (area.id === id) {
        const updated = { ...area, status: area.status === 'Active' ? 'Inactive' : 'Active' as const };
        if (selectedArea?.id === id) setSelectedArea(updated);
        return updated;
      }
      return area;
    });
    onUpdateAreas(updatedAreas);
  };`;

code = code.replace(oldToggle, newToggle);

// deleteArea
const oldDelete = `  const deleteArea = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service area? All associated data (users, merchants, products, orders) will be permanently deleted.')) return;
    fetch(\`/api/admin/service-areas/\${id}\`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAreas(areas.filter(a => a.id !== id));
        if (selectedArea?.id === id) setSelectedArea(null);
      }
    })
    .catch(err => console.error(err));
  };`;
  
const newDelete = `  const deleteArea = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service area? All associated data (users, merchants, products, orders) will be permanently deleted.')) return;
    onUpdateAreas(areas.filter(a => a.id !== id));
    if (selectedArea?.id === id) setSelectedArea(null);
  };`;

code = code.replace(oldDelete, newDelete);

fs.writeFileSync('src/components/ServiceAreaManager.tsx', code);
console.log('Fixed ServiceAreaManager.tsx');
