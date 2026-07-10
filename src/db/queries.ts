import { db } from './index.ts';
import { users, orders, supportTickets } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// 1. User queries
export async function upsertUser(data: {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  locationHi?: string;
  role?: string;
}) {
  try {
    const result = await db.insert(users)
      .values({
        uid: data.uid,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        locationHi: data.locationHi || null,
        role: data.role || 'customer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          location: data.location || null,
          locationHi: data.locationHi || null,
          role: data.role || 'customer',
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Database user upsert failed. Please try again later.", { cause: error });
  }
}

export async function getUser(uid: string) {
  try {
    const result = await db.select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database getUser failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

// 2. Order queries
export async function saveOrder(data: {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  total: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus: string;
  date: string;
  items: any;
}) {
  try {
    const result = await db.insert(orders)
      .values({
        id: data.id,
        userId: data.userId,
        storeId: data.storeId,
        storeName: data.storeName,
        total: data.total,
        discount: data.discount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        deliveryStatus: data.deliveryStatus,
        date: data.date,
        items: data.items,
      })
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          paymentStatus: data.paymentStatus,
          deliveryStatus: data.deliveryStatus,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database saveOrder failed:", error);
    throw new Error("Database saveOrder failed. Please try again later.", { cause: error });
  }
}

export async function getUserOrders(userId: string) {
  try {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Database getUserOrders failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getAllOrders() {
  try {
    return await db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Database getAllOrders failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getOrderById(id: string) {
  try {
    const result = await db.select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database getOrderById failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

// 3. Support Tickets
export async function saveSupportTicket(data: {
  id: string;
  userId: string;
  subject: string;
  category: string;
  status: string;
  messages: any;
}) {
  try {
    const result = await db.insert(supportTickets)
      .values({
        id: data.id,
        userId: data.userId,
        subject: data.subject,
        category: data.category,
        status: data.status,
        messages: data.messages,
      })
      .onConflictDoUpdate({
        target: supportTickets.id,
        set: {
          status: data.status,
          messages: data.messages,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database saveSupportTicket failed:", error);
    throw new Error("Database saveSupportTicket failed. Please try again later.", { cause: error });
  }
}

export async function getUserSupportTickets(userId: string) {
  try {
    return await db.select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  } catch (error) {
    console.error("Database getUserSupportTickets failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getAllSupportTickets() {
  try {
    return await db.select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  } catch (error) {
    console.error("Database getAllSupportTickets failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
