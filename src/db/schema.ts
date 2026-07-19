import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  location: text('location'),
  locationHi: text('location_hi'),
  role: text('role').default('customer').notNull(),
  serviceAreaId: text('service_area_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid),
  storeId: text('store_id').notNull(),
  storeName: text('store_name').notNull(),
  total: integer('total').notNull(),
  discount: integer('discount').default(0).notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').default('pending').notNull(),
  deliveryStatus: text('delivery_status').default('pending').notNull(),
  date: text('date').notNull(),
  items: jsonb('items').notNull(), // JSON list of ordered items
  serviceAreaId: text('service_area_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid),
  subject: text('subject').notNull(),
  category: text('category').notNull(),
  status: text('status').default('open').notNull(),
  messages: jsonb('messages').notNull(), // JSON list of support messages
  createdAt: timestamp('created_at').defaultNow(),
});
