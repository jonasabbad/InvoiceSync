import { 
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private phoneNumbers: Map<number, PhoneNumber>;
  private services: Map<number, Service>;
  
  private userCurrentId: number;
  private customerCurrentId: number;
  private phoneNumberCurrentId: number;
  private serviceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.phoneNumbers = new Map();
    this.services = new Map();
    
    this.userCurrentId = 1;
    this.customerCurrentId = 1;
    this.phoneNumberCurrentId = 1;
    this.serviceCurrentId = 1;

    // Add some initial data for testing
    this.initializeTestData();
  }

  private initializeTestData() {
    // Add a sample customer
    const customer: Customer = {
      id: this.customerCurrentId++,
      name: "Ahmed Mohammed",
      responsible: "Mohammed Ahmed"
    };
    this.customers.set(customer.id, customer);

    // Add phone numbers for the customer
    this.phoneNumbers.set(this.phoneNumberCurrentId, {
      id: this.phoneNumberCurrentId++,
      customerId: customer.id,
      number: "+966 54 123 4567",
      isPrimary: true
    });
    
    this.phoneNumbers.set(this.phoneNumberCurrentId, {
      id: this.phoneNumberCurrentId++,
      customerId: customer.id,
      number: "+966 50 765 4321",
      isPrimary: false
    });

    // Add services for the customer
    this.services.set(this.serviceCurrentId, {
      id: this.serviceCurrentId++,
      customerId: customer.id,
      name: "Electricity",
      code: "ELEC-1001-A",
      notes: "Main building"
    });
    
    this.services.set(this.serviceCurrentId, {
      id: this.serviceCurrentId++,
      customerId: customer.id,
      name: "Water",
      code: "WATER-455-B",
      notes: "Monthly service"
    });
    
    this.services.set(this.serviceCurrentId, {
      id: this.serviceCurrentId++,
      customerId: customer.id,
      name: "Internet",
      code: "NET-789-C",
      notes: "Fiber optic"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined> {
    const phone = Array.from(this.phoneNumbers.values()).find(
      (phone) => phone.number.replace(/\s+/g, '') === phoneNumber.replace(/\s+/g, '')
    );
    
    if (!phone) return undefined;
    
    return this.customers.get(phone.customerId);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerCurrentId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer: Customer = { ...customer, ...customerUpdate };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Delete all related phone numbers and services
    const phoneNumbersToDelete = Array.from(this.phoneNumbers.values())
      .filter(phone => phone.customerId === id);
    
    for (const phone of phoneNumbersToDelete) {
      this.phoneNumbers.delete(phone.id);
    }
    
    const servicesToDelete = Array.from(this.services.values())
      .filter(service => service.customerId === id);
    
    for (const service of servicesToDelete) {
      this.services.delete(service.id);
    }
    
    return this.customers.delete(id);
  }

  async getCustomerWithDetails(id: number): Promise<CustomerWithDetails | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const phoneNumbers = Array.from(this.phoneNumbers.values())
      .filter(phone => phone.customerId === id);
    
    const services = Array.from(this.services.values())
      .filter(service => service.customerId === id);
    
    return {
      ...customer,
      phoneNumbers,
      services
    };
  }

  // Phone number methods
  async getPhoneNumbers(customerId: number): Promise<PhoneNumber[]> {
    return Array.from(this.phoneNumbers.values())
      .filter(phone => phone.customerId === customerId);
  }

  async createPhoneNumber(insertPhoneNumber: InsertPhoneNumber): Promise<PhoneNumber> {
    // If this is the primary phone, update all other phones to non-primary
    if (insertPhoneNumber.isPrimary) {
      for (const [id, phone] of this.phoneNumbers.entries()) {
        if (phone.customerId === insertPhoneNumber.customerId && phone.isPrimary) {
          this.phoneNumbers.set(id, { ...phone, isPrimary: false });
        }
      }
    }
    
    const id = this.phoneNumberCurrentId++;
    const phoneNumber: PhoneNumber = { ...insertPhoneNumber, id };
    this.phoneNumbers.set(id, phoneNumber);
    return phoneNumber;
  }

  async updatePhoneNumber(id: number, phoneNumberUpdate: Partial<InsertPhoneNumber>): Promise<PhoneNumber | undefined> {
    const phoneNumber = this.phoneNumbers.get(id);
    if (!phoneNumber) return undefined;
    
    // If updating to primary, update all other phones to non-primary
    if (phoneNumberUpdate.isPrimary) {
      for (const [phoneId, phone] of this.phoneNumbers.entries()) {
        if (phone.customerId === phoneNumber.customerId && phone.isPrimary && phoneId !== id) {
          this.phoneNumbers.set(phoneId, { ...phone, isPrimary: false });
        }
      }
    }
    
    const updatedPhoneNumber: PhoneNumber = { ...phoneNumber, ...phoneNumberUpdate };
    this.phoneNumbers.set(id, updatedPhoneNumber);
    return updatedPhoneNumber;
  }

  async deletePhoneNumber(id: number): Promise<boolean> {
    const phoneNumber = this.phoneNumbers.get(id);
    if (!phoneNumber) return false;
    
    // If deleting a primary phone, set another phone as primary if exists
    if (phoneNumber.isPrimary) {
      const otherPhones = Array.from(this.phoneNumbers.values())
        .filter(phone => phone.customerId === phoneNumber.customerId && phone.id !== id);
      
      if (otherPhones.length > 0) {
        const newPrimaryPhone = otherPhones[0];
        this.phoneNumbers.set(newPrimaryPhone.id, { ...newPrimaryPhone, isPrimary: true });
      }
    }
    
    return this.phoneNumbers.delete(id);
  }

  // Service methods
  async getServices(customerId: number): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter(service => service.customerId === customerId);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService: Service = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
}

export const storage = new MemStorage();
