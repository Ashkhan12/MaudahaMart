/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Store, Product, Review, Order, Notification, Language, RegisteredUser, 
  SupportTicket, SystemSettings, CustomPanel, PayoutRequest, PriceChangeLog, 
  Restaurant, ClothingBoutique, MerchantRequest, ServiceArea 
} from '../types';
import ServiceAreaManager from './ServiceAreaManager';

interface AdminPortalProps {
  stores: Store[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  notifications: Notification[];
  language: Language;
  users: RegisteredUser[];
  supportTickets: SupportTicket[];
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  customPanels: CustomPanel[];
  onUpdateCustomPanels: (panels: CustomPanel[]) => void;
  onUpdateStores: (stores: Store[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateReviews: (reviews: Review[]) => void;
  onUpdateUsers: (users: RegisteredUser[]) => void;
  onAddNotification: (notification: Notification) => void;
  onAdminReplySupportTicket: (ticketId: string, text: string) => void;
  onToggleTicketStatus: (ticketId: string, status: 'open' | 'resolved') => void;
  onUpdateOrders: (orders: Order[]) => void;
  payoutRequests: PayoutRequest[];
  onUpdatePayoutRequests: (requests: PayoutRequest[]) => void;
  merchantRequests?: MerchantRequest[];
  onUpdateMerchantRequests?: (requests: MerchantRequest[]) => void;
  priceLogs: PriceChangeLog[];
  onUpdateProductPricesAndStock?: (productId: string, updates: { mrp?: number; sellingPrice?: number; msp?: number; price?: number; stock?: number; name?: string; nameHi?: string; image?: string }, changedBy: 'seller' | 'admin', changerName: string) => void;
  restaurants: Restaurant[];
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  boutiques: ClothingBoutique[];
  onUpdateBoutiques: (boutiques: ClothingBoutique[]) => void;
  activeAdminTab?: string;
  setActiveAdminTab?: (tab: string) => void;
  
  // Service Areas Multi-Tenant isolation
  serviceAreas: ServiceArea[];
  onUpdateServiceAreas: (areas: ServiceArea[]) => void;
}

export default function AdminPortal(props: AdminPortalProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <ServiceAreaManager 
        areas={props.serviceAreas} 
        onUpdateAreas={props.onUpdateServiceAreas}
        allUsers={props.users}
        allStores={props.stores}
        onUpdateStores={props.onUpdateStores}
        allProducts={props.products}
        onUpdateProducts={props.onUpdateProducts}
        allOrders={props.orders}
        allTickets={props.supportTickets}
        onToggleTicketStatus={props.onToggleTicketStatus}
        onUpdateUsers={props.onUpdateUsers}
      />
    </div>
  );
}
