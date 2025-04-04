import { 
  users, customers, phoneNumbers, services,
  type User, 
  type InsertUser, 
  type Customer, 
  type InsertCustomer,
  type PhoneNumber,
  type InsertPhoneNumber,
  type Service,
  type InsertService,
  type CustomerWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, and, asc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  getCustomerWithDetails(id: number): Promise<CustomerWithDetails | undefined>;

  // Phone number methods
  getPhoneNumbers(customerId: number): Promise<PhoneNumber[]>;
  createPhoneNumber(phoneNumber: InsertPhoneNumber): Promise<PhoneNumber>;
  updatePhoneNumber(id: number, phoneNumber: Partial<InsertPhoneNumber>): Promise<PhoneNumber | undefined>;
  deletePhoneNumber(id: number): Promise<boolean>;

  // Service methods
  getServices(customerId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(asc(customers.name));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined> {
    // Normalize the phone number by removing spaces for comparison
    const normalizedPhone = phoneNumber.replace(/\s+/g, '');
    
    // First find the matching phone number
    const phones = await db.select().from(phoneNumbers);
    const matchingPhone = phones.find(phone => 
      phone.number.replace(/\s+/g, '') === normalizedPhone
    );
    
    if (!matchingPhone) return undefined;
    
    // Then get the customer
    const result = await db.select().from(customers).where(eq(customers.id, matchingPhone.customerId));
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db
      .update(customers)
      .set(customerUpdate)
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Due to cascading deletes defined in the schema, related phone numbers and services will be automatically deleted
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }

  async getCustomerWithDetails(id: number): Promise<CustomerWithDetails | undefined> {
    const customer = await this.getCustomer(id);
    if (!customer) return undefined;
    
    const customerPhones = await this.getPhoneNumbers(id);
    const customerServices = await this.getServices(id);
    
    return {
      ...customer,
      phoneNumbers: customerPhones,
      services: customerServices
    };
  }

  // Phone number methods
  async getPhoneNumbers(customerId: number): Promise<PhoneNumber[]> {
    return db
      .select()
      .from(phoneNumbers)
      .where(eq(phoneNumbers.customerId, customerId));
  }

  async createPhoneNumber(insertPhoneNumber: InsertPhoneNumber): Promise<PhoneNumber> {
    // If this is the primary phone, update all other phones to non-primary
    if (insertPhoneNumber.isPrimary) {
      await db
        .update(phoneNumbers)
        .set({ isPrimary: false })
        .where(
          and(
            eq(phoneNumbers.customerId, insertPhoneNumber.customerId),
            eq(phoneNumbers.isPrimary, true)
          )
        );
    }
    
    const result = await db.insert(phoneNumbers).values(insertPhoneNumber).returning();
    return result[0];
  }

  async updatePhoneNumber(id: number, phoneNumberUpdate: Partial<InsertPhoneNumber>): Promise<PhoneNumber | undefined> {
    // Get the current phone to check if we're updating a primary phone
    const currentPhones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, id));
    const currentPhone = currentPhones[0];
    
    if (!currentPhone) return undefined;
    
    // If updating to primary, update all other phones to non-primary
    if (phoneNumberUpdate.isPrimary) {
      await db
        .update(phoneNumbers)
        .set({ isPrimary: false })
        .where(
          and(
            eq(phoneNumbers.customerId, currentPhone.customerId),
            eq(phoneNumbers.isPrimary, true),
            //We don't want to update the current phone yet
            ne(phoneNumbers.id, id)
          )
        );
    }
    
    const result = await db
      .update(phoneNumbers)
      .set(phoneNumberUpdate)
      .where(eq(phoneNumbers.id, id))
      .returning();
    
    return result[0];
  }

  async deletePhoneNumber(id: number): Promise<boolean> {
    // Get the phone number before deleting
    const currentPhones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, id));
    const phoneNumber = currentPhones[0];
    
    if (!phoneNumber) return false;
    
    // If deleting a primary phone, set another phone as primary if exists
    if (phoneNumber.isPrimary) {
      const otherPhones = await db
        .select()
        .from(phoneNumbers)
        .where(
          and(
            eq(phoneNumbers.customerId, phoneNumber.customerId),
            ne(phoneNumbers.id, id)
          )
        );
      
      if (otherPhones.length > 0) {
        await db
          .update(phoneNumbers)
          .set({ isPrimary: true })
          .where(eq(phoneNumbers.id, otherPhones[0].id));
      }
    }
    
    const result = await db.delete(phoneNumbers).where(eq(phoneNumbers.id, id)).returning();
    return result.length > 0;
  }

  // Service methods
  async getServices(customerId: number): Promise<Service[]> {
    return db
      .select()
      .from(services)
      .where(eq(services.customerId, customerId));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const result = await db.insert(services).values(insertService).returning();
    return result[0];
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db
      .update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    
    return result[0];
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
