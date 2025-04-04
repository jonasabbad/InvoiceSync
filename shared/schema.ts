import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  responsible: text("responsible"),
});

export const customersRelations = relations(customers, ({ many }) => ({
  phoneNumbers: many(phoneNumbers),
  services: many(services),
}));

export const phoneNumbers = pgTable("phone_numbers", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  isPrimary: boolean("is_primary").default(false),
});

export const phoneNumbersRelations = relations(phoneNumbers, ({ one }) => ({
  customer: one(customers, {
    fields: [phoneNumbers.customerId],
    references: [customers.id],
  }),
}));

export const services = pgTable("services", {
  id: serial("id").primaryKey(), 
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code").notNull(),
  notes: text("notes"),
});

export const servicesRelations = relations(services, ({ one }) => ({
  customer: one(customers, {
    fields: [services.customerId],
    references: [customers.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  responsible: true,
});

export const insertPhoneNumberSchema = createInsertSchema(phoneNumbers).pick({
  customerId: true,
  number: true,
  isPrimary: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  customerId: true,
  name: true,
  code: true,
  notes: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertPhoneNumber = z.infer<typeof insertPhoneNumberSchema>;
export type PhoneNumber = typeof phoneNumbers.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Type for customer with phone numbers and services
export type CustomerWithDetails = Customer & {
  phoneNumbers: PhoneNumber[];
  services: Service[];
};
