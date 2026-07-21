const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceAreaManager.tsx', 'utf8');

// Update imports
if (!code.includes("import { ServiceArea }")) {
  code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { ServiceArea } from '../types';");
}

// Update component signature
code = code.replace("export default function ServiceAreaManager() {", 
`interface ServiceAreaManagerProps {
  areas: ServiceArea[];
  onUpdateAreas: (areas: ServiceArea[]) => void;
}

export default function ServiceAreaManager({ areas, onUpdateAreas }: ServiceAreaManagerProps) {`);

// Remove internal areas state and the fetch useEffect
code = code.replace("const [areas, setAreas] = useState<any[]>([]);", "");

const oldFetchEffect = `  useEffect(() => {
    fetch('/api/admin/service-areas')
      .then(res => res.json())
      .then(data => {
        setAreas(data);
      })
      .catch(err => console.error("Error fetching areas", err));
  }, []);`;
  
code = code.replace(oldFetchEffect, "");

// Rewrite handleAddArea
const oldHandleAddArea = /const handleAddArea = \(e: React\.FormEvent\) => \{[\s\S]*?catch\(err => console\.error\(err\)\);\s*\};/m;
const newHandleAddArea = `const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName) return;
    
    const newArea: ServiceArea = {
      id: 'area-' + Date.now().toString(),
      area_name: newAreaName,
      pincode: '',
      city: newAreaName,
      state: '',
      delivery_charge: 0,
      free_delivery_above: 0,
      minimum_order_amount: 0,
      estimated_delivery_time: '30-45 mins',
      max_distance_km: 5,
      polygon_coordinates: [],
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_orders: 0,
      monthly_orders: 0,
      active_customers: 0,
      revenue: 0,
      average_delivery_time: '0 mins',
      delivery_slots: [],
      delivery_types: []
    };
    
    onUpdateAreas([...areas, newArea]);
    setNewAreaName('');
    setShowAddModal(false);
  };`;
code = code.replace(oldHandleAddArea, newHandleAddArea);

// Rewrite toggleStatus
const oldToggleStatus = /const toggleStatus = \(id: string\) => \{[\s\S]*?catch\(err => console\.error\(err\)\);\s*\};/m;
const newToggleStatus = `const toggleStatus = (id: string) => {
    const updated = areas.map(area => {
      if (area.id === id) {
        return { ...area, status: area.status === 'Active' ? 'Inactive' : 'Active' } as ServiceArea;
      }
      return area;
    });
    onUpdateAreas(updated);
  };`;
code = code.replace(oldToggleStatus, newToggleStatus);

// Rewrite handleDeleteArea
const oldHandleDeleteArea = /const handleDeleteArea = \(id: string\) => \{[\s\S]*?catch\(err => console\.error\(err\)\);\s*\};/m;
const newHandleDeleteArea = `const handleDeleteArea = (id: string) => {
    if (confirm('Are you sure you want to delete this area?')) {
      onUpdateAreas(areas.filter(a => a.id !== id));
      if (selectedArea?.id === id) {
        setSelectedArea(null);
      }
    }
  };`;
code = code.replace(oldHandleDeleteArea, newHandleDeleteArea);

fs.writeFileSync('src/components/ServiceAreaManager.tsx', code);
