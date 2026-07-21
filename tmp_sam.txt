import React, { useState, useEffect } from 'react';
import { Map, Users, ShoppingBag, Truck, Ticket, Plus, Activity, Power, Settings, Search, Package, MapPin, Tag, LifeBuoy, ArrowLeft, Trash2 } from 'lucide-react';

export default function ServiceAreaManager() {
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [productsStats, setProductsStats] = useState<any>({});
  const [ordersStats, setOrdersStats] = useState<any>({});
  const [deliveryPartners, setDeliveryPartners] = useState<any>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/service-areas')
      .then(res => res.json())
      .then(data => {
        setAreas(data);
      })
      .catch(err => console.error("Error fetching areas", err));
  }, []);

  useEffect(() => {
    if (selectedArea) {
      if (activeTab === 'users') {
        fetch(`/api/admin/service-areas/${selectedArea.id}/users`).then(res => res.json()).then(setUsers).catch(console.error);
        fetch(`/api/admin/service-areas/${selectedArea.id}/vendors`).then(res => res.json()).then(setVendors).catch(console.error);
      } else if (activeTab === 'catalog') {
        fetch(`/api/admin/service-areas/${selectedArea.id}/products`).then(res => res.json()).then(setProductsStats).catch(console.error);
        fetch(`/api/admin/service-areas/${selectedArea.id}/orders`).then(res => res.json()).then(setOrdersStats).catch(console.error);
      } else if (activeTab === 'delivery') {
        fetch(`/api/admin/service-areas/${selectedArea.id}/delivery-partners`).then(res => res.json()).then(setDeliveryPartners).catch(console.error);
      } else if (activeTab === 'marketing') {
        fetch(`/api/admin/service-areas/${selectedArea.id}/coupons`).then(res => res.json()).then(setCoupons).catch(console.error);
        fetch(`/api/admin/service-areas/${selectedArea.id}/support-tickets`).then(res => res.json()).then(setTickets).catch(console.error);
      }
    }
  }, [selectedArea, activeTab]);

  const handleAddArea = (e: React.FormEvent) => {
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
  };

  const toggleStatus = (id: string) => {
    fetch(`/api/admin/service-areas/${id}/status`, { method: 'PATCH' })
    .then(res => res.json())
    .then(updated => {
      setAreas(areas.map(area => area.id === id ? updated : area));
      if (selectedArea?.id === id) setSelectedArea(updated);
    })
    .catch(err => console.error(err));
  };

  const deleteArea = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service area? All associated data (users, merchants, products, orders) will be permanently deleted.')) return;
    fetch(`/api/admin/service-areas/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAreas(areas.filter(a => a.id !== id));
        if (selectedArea?.id === id) setSelectedArea(null);
      }
    })
    .catch(err => console.error(err));
  };
  
  const updateDeliverySettings = () => {
    if (!selectedArea) return;
    fetch(`/api/admin/service-areas/${selectedArea.id}/delivery-settings`, { method: 'PUT' })
    .then(res => res.json())
    .then(data => alert("Updated successfully!"))
    .catch(console.error);
  };

  if (!selectedArea) {
    return (
      <div className="font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <MapPin className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">{areas.length} Service Areas</h2>
            <p className="text-slate-500 font-medium text-sm mb-8">
              Manage your operational zones and service regions from one central dashboard.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
              {areas.map(area => (
                <div 
                  key={area.id} 
                  className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl p-5 text-left transition flex flex-col justify-between group relative"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteArea(area.id); }}
                    className="absolute top-4 right-4 p-2 bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-200 transition opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    title="Delete Area & All Data"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="cursor-pointer" onClick={() => setSelectedArea(area)}>
                    <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-emerald-800 pr-10">{area.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4"><Activity className="h-3 w-3" /> Radius: {area.radius}</p>
                  </div>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedArea(area)}>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider ${
                      area.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {area.status}
                    </span>
                    <span className="text-emerald-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition">Manage &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" /> Add New Service Area
            </button>
          </div>
        </div>

        {/* MODAL: Add New Service Area */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">New Region</h3>
              </div>
              <form onSubmit={handleAddArea} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Area Name / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Connaught Place, Delhi"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer">Initialize Area</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] font-sans rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => setSelectedArea(null)}
            className="mt-1 h-8 w-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 transition"
            title="Back to List"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
              {selectedArea.name}
              <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest border ${
                selectedArea.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {selectedArea.status}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage geographic boundaries, local operations, and merchants for this zone.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleStatus(selectedArea.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-sm ${
              selectedArea.status === 'Active' ? 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50' : 'bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Power className="h-4 w-4" />
            {selectedArea.status === 'Active' ? 'Suspend Operations' : 'Activate Region'}
          </button>
          <button
            onClick={() => deleteArea(selectedArea.id)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-sm bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          >
            <Trash2 className="h-4 w-4" />
            Delete Area
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 flex px-8 space-x-4 overflow-x-auto shrink-0 scrollbar-hide pt-2">
        {[
          { id: 'status', label: 'Overview & Map', icon: Map },
          { id: 'users', label: 'Users & Sellers', icon: Users },
          { id: 'catalog', label: 'Products & Orders', icon: ShoppingBag },
          { id: 'delivery', label: 'Delivery Logistics', icon: Truck },
          { id: 'marketing', label: 'Marketing & Support', icon: Ticket }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 pt-2 px-2 border-b-2 font-bold text-sm whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Body based on Active Tab */}
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        {activeTab === 'status' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" /> Geo-Fencing Boundary
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Define the operational polygon for {selectedArea.name}.</p>
                </div>
                <button className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Configure Area
                </button>
              </div>
              <div className="h-80 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Map className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-bold text-base">Interactive Map Integration</p>
                <p className="text-xs font-medium mt-1">Live coordinates sync enabled via API</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" /> Registered Users
                </h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{users.length} Total</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{u.location}</p>
                    </div>
                    <span className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-600 font-bold">Customer</span>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Search className="h-6 w-6 opacity-50" />
                    <p className="text-sm font-medium">No users found</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-600" /> Partner Merchants
                </h3>
                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">{vendors.length} Active</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {vendors.map(v => (
                   <div key={v.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div>
                       <p className="text-sm font-bold text-slate-800">{v.name}</p>
                     </div>
                     <span className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg font-bold">{v.type}</span>
                   </div>
                ))}
                {vendors.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Search className="h-6 w-6 opacity-50" />
                    <p className="text-sm font-medium">No merchants found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center py-16">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">Live Product Catalog</h3>
              <div className="text-6xl font-black text-blue-600 tracking-tight mb-4">{productsStats.total || '--'}</div>
              <span className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">{productsStats.message || 'Loading...'}</span>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center py-16">
              <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">Real-time Orders</h3>
              <div className="text-6xl font-black text-orange-600 tracking-tight mb-4">{ordersStats.totalActive || '--'}</div>
              <span className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">{ordersStats.message || 'Loading...'}</span>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Truck className="h-6 w-6" /></div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Delivery Operations</h3>
                <p className="text-sm text-slate-500">Configure logistics constraints and active fleet for this region.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Timing Slots</label>
                <select className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-base font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer">
                  <option>Morning (7:00 AM - 12:00 PM)</option>
                  <option>Full Day (9:00 AM - 9:00 PM)</option>
                  <option>24/7 Night Delivery Enabled</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Allowed Modes</label>
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <label className="flex items-center space-x-3 text-base font-medium text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5" /> 
                    <span>Instant Delivery (30 Mins)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-base font-medium text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5" /> 
                    <span>Scheduled Slots</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Active Fleet</h4>
                    <p className="text-xs text-slate-500 font-medium">Riders currently online</p>
                  </div>
                  <span className="ml-6 bg-emerald-100 text-emerald-800 text-lg px-4 py-1.5 rounded-xl font-black border border-emerald-200">
                    {deliveryPartners.online || 0}
                  </span>
              </div>
              <button onClick={updateDeliverySettings} className="bg-slate-900 text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-slate-800 transition cursor-pointer shadow-sm flex items-center justify-center gap-2">
                <Settings className="h-5 w-5" /> Save Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="h-5 w-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-800 text-base">Active Promotions</h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex-1 flex flex-col gap-4 overflow-y-auto">
                {coupons.length > 0 ? coupons.map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs border-l-4 border-l-purple-500">
                    <span className="font-mono text-base font-black text-slate-800 tracking-wider">{c.code}</span>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">ACTIVE</span>
                  </div>
                )) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium">No active coupons</div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <LifeBuoy className="h-5 w-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-800 text-base">Open Support Tickets</h3>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {tickets.map(t => (
                  <div key={t.id} className="p-4 bg-white border border-rose-100 rounded-xl flex flex-col gap-3 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                      <div className="flex justify-between items-start pl-3">
                        <span className="font-bold text-sm text-slate-800">#{t.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">{t.status}</span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium pl-3 leading-relaxed">{t.subject}</p>
                      <div className="pl-3 pt-3 border-t border-slate-50 mt-1">
                        <span className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1">Resolve Ticket &rarr;</span>
                      </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                     <Activity className="h-8 w-8 mb-3 opacity-50" />
                     <p className="text-sm font-medium">Inbox zero! No open tickets.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
