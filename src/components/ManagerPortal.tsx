import React, { useState } from 'react';
import { 
  Users, Store, Ticket, Search, Plus, Navigation, CheckCircle, ShieldAlert,
  ShoppingBag, Shield, Clock, TrendingUp, AlertCircle
} from 'lucide-react';
import { RegisteredUser, Store as StoreType, SupportTicket, Product, Language } from '../types';

interface ManagerPortalProps {
  users: RegisteredUser[];
  onUpdateUsers: (users: RegisteredUser[]) => void;
  stores: StoreType[];
  onUpdateStores: (stores: StoreType[]) => void;
  products: Product[];
  tickets: SupportTicket[];
  language: Language;
  activeUserId: string;
}

export default function ManagerPortal({
  users,
  onUpdateUsers,
  stores,
  onUpdateStores,
  products,
  tickets,
  language,
  activeUserId
}: ManagerPortalProps) {
  const [activeTab, setActiveTab] = useState<'shops' | 'sellers' | 'customers' | 'tickets'>('shops');
  
  const managerUser = users.find(u => u.id === activeUserId);
  const managerArea = managerUser?.assignedArea || 'Maudaha'; // Default to Maudaha if not set

  // Derived filtered data based on manager's assigned area
  const areaSellers = users.filter(u => {
    if (u.role !== 'merchant') return false;
    if (u.assignedArea) return u.assignedArea === managerArea;
    return u.location.toLowerCase().includes(managerArea.toLowerCase());
  });
  const areaCustomers = users.filter(u => {
    if (u.role !== 'customer') return false;
    if (u.assignedArea) return u.assignedArea === managerArea;
    return u.location.toLowerCase().includes(managerArea.toLowerCase());
  });
  const areaStores = stores.filter(s => s.area === managerArea);
  
  // A support ticket belongs to the area if the user who created it belongs to the area
  const areaTickets = tickets.filter(t => {
    const ticketUser = users.find(u => u.id === t.userId);
    if (!ticketUser) return false;
    if (ticketUser.assignedArea) return ticketUser.assignedArea === managerArea;
    return ticketUser.location.toLowerCase().includes(managerArea.toLowerCase());
  });

  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName || !newSellerPhone) return;

    const newSeller: RegisteredUser = {
      id: `merchant-${Date.now()}`,
      name: newSellerName,
      phone: newSellerPhone,
      location: managerArea,
      locationHi: managerArea,
      role: 'merchant',
      assignedArea: managerArea,
      activities: [],
      searchHistory: []
    };

    onUpdateUsers([...users, newSeller]);
    setNewSellerName('');
    setNewSellerPhone('');
    alert(language === 'hi' ? 'नया विक्रेता सफलतापूर्वक जोड़ा गया!' : 'New seller added successfully!');
  };

  const t = {
    hi: {
      title: 'प्रबंधक पोर्टल (Manager Portal)',
      area: 'निर्धारित क्षेत्र:',
      sellers: 'विक्रेता',
      customers: 'ग्राहक',
      tickets: 'सपोर्ट टिकट',
      addSeller: 'नया विक्रेता जोड़ें',
      name: 'नाम',
      phone: 'फ़ोन नंबर',
      create: 'बनाएं',
      noData: 'कोई डेटा नहीं मिला',
      shops: 'दुकानें'
    },
    en: {
      title: 'Manager Portal',
      area: 'Assigned Area:',
      sellers: 'Sellers',
      customers: 'Customers',
      tickets: 'Support Tickets',
      addSeller: 'Add New Seller',
      name: 'Name',
      phone: 'Phone Number',
      create: 'Create',
      noData: 'No data found',
      shops: 'Shops'
    }
  }[language];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black">{t.title}</h2>
          <p className="text-blue-200 mt-2 flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            {t.area} <span className="font-bold text-white">{managerArea}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeTab === 'shops' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.shops} ({areaStores.length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeTab === 'sellers' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.sellers} ({areaSellers.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeTab === 'customers' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.customers} ({areaCustomers.length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.tickets} ({areaTickets.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'shops' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">{t.shops}</h3>
            {areaStores.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center text-slate-500">{t.noData}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areaStores.map(store => {
                  const storeProducts = products.filter(p => p.storeId === store.id);
                  return (
                    <div key={store.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                      <div className="h-32 w-full overflow-hidden">
                        <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex-1">
                        <h4 className="font-black text-slate-800">{language === 'hi' ? store.nameHi : store.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{language === 'hi' ? store.addressHi : store.address}</p>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
                          <span>Products: {storeProducts.length}</span>
                          <span>Rating: {store.rating} ⭐</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-800">{t.sellers}</h3>
              {areaSellers.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl text-center text-slate-500">{t.noData}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areaSellers.map(seller => (
                    <div key={seller.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{seller.name}</h4>
                        <p className="text-xs text-slate-500">{seller.phone}</p>
                        <p className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 mt-2 inline-block">ID: {seller.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.addSeller}</h3>
              <form onSubmit={handleCreateSeller} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">{t.name}</label>
                  <input
                    type="text"
                    required
                    value={newSellerName}
                    onChange={(e) => setNewSellerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">{t.phone}</label>
                  <input
                    type="tel"
                    required
                    value={newSellerPhone}
                    onChange={(e) => setNewSellerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t.create}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">{t.customers}</h3>
            {areaCustomers.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center text-slate-500">{t.noData}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaCustomers.map(customer => (
                  <div key={customer.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{customer.name}</h4>
                      <p className="text-xs text-slate-500">{customer.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">{t.tickets}</h3>
            {areaTickets.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center text-slate-500">{t.noData}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areaTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        #{ticket.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{ticket.subject}</h4>
                    <p className="text-xs text-slate-500 mb-3">User: {ticket.userName} ({ticket.userPhone})</p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-y-auto text-xs">
                      {ticket.messages.map(msg => (
                        <div key={msg.id} className="mb-2">
                          <span className="font-bold text-slate-700">{msg.senderName}: </span>
                          <span className="text-slate-600">{msg.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
