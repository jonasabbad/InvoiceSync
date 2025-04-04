import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertPhoneNumberSchema, 
  insertServiceSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Customers API
  app.get("/api/customers", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }

      const customer = await storage.getCustomerWithDetails(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.get("/api/customers/search/:query", async (req: Request, res: Response) => {
    try {
      const query = req.params.query;
      // Check if query is a phone number
      const customer = await storage.getCustomerByPhone(query);
      if (customer) {
        const customerWithDetails = await storage.getCustomerWithDetails(customer.id);
        return res.json(customerWithDetails);
      }

      // Check if query is a customer ID
      const id = Number(query);
      if (!isNaN(id)) {
        const customerById = await storage.getCustomerWithDetails(id);
        if (customerById) {
          return res.json(customerById);
        }
      }

      return res.status(404).json({ message: "Customer not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to search for customer" });
    }
  });

  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const result = insertCustomerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid customer data", errors: result.error.errors });
      }

      const customer = await storage.createCustomer(result.data);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }

      const result = insertCustomerSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid customer data", errors: result.error.errors });
      }

      const updatedCustomer = await storage.updateCustomer(id, result.data);
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }

      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Phone Numbers API
  app.get("/api/customers/:customerId/phones", async (req: Request, res: Response) => {
    try {
      const customerId = Number(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }

      const phones = await storage.getPhoneNumbers(customerId);
      res.json(phones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch phone numbers" });
    }
  });

  app.post("/api/phones", async (req: Request, res: Response) => {
    try {
      const result = insertPhoneNumberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid phone number data", errors: result.error.errors });
      }

      const phoneNumber = await storage.createPhoneNumber(result.data);
      res.status(201).json(phoneNumber);
    } catch (error) {
      res.status(500).json({ message: "Failed to create phone number" });
    }
  });

  app.patch("/api/phones/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid phone number ID" });
      }

      const result = insertPhoneNumberSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid phone number data", errors: result.error.errors });
      }

      const updatedPhoneNumber = await storage.updatePhoneNumber(id, result.data);
      if (!updatedPhoneNumber) {
        return res.status(404).json({ message: "Phone number not found" });
      }

      res.json(updatedPhoneNumber);
    } catch (error) {
      res.status(500).json({ message: "Failed to update phone number" });
    }
  });

  app.delete("/api/phones/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid phone number ID" });
      }

      const success = await storage.deletePhoneNumber(id);
      if (!success) {
        return res.status(404).json({ message: "Phone number not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete phone number" });
    }
  });

  // Services API
  app.get("/api/customers/:customerId/services", async (req: Request, res: Response) => {
    try {
      const customerId = Number(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }

      const services = await storage.getServices(customerId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const result = insertServiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid service data", errors: result.error.errors });
      }

      const service = await storage.createService(result.data);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.patch("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }

      const result = insertServiceSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid service data", errors: result.error.errors });
      }

      const updatedService = await storage.updateService(id, result.data);
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }

      const success = await storage.deleteService(id);
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Google Sheets API proxy
  app.get("/api/sheets/sync", async (req: Request, res: Response) => {
    try {
      // This endpoint would normally interact with Google Sheets
      // For now, just return the current data from memory storage
      const customers = await storage.getCustomers();
      const customersWithDetails = await Promise.all(
        customers.map(async (customer) => {
          return await storage.getCustomerWithDetails(customer.id);
        })
      );
      
      res.json({ synced: true, data: customersWithDetails });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync with Google Sheets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
