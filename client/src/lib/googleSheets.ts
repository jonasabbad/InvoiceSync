import { apiRequest } from "./queryClient";
import {
  CustomerWithDetails,
  InsertCustomer,
  Customer,
  PhoneNumber,
  InsertPhoneNumber,
  Service,
  InsertService,
} from "@shared/schema";

// Key for storing the Google Apps Script URL in local storage
const GOOGLE_APPS_SCRIPT_URL_KEY = 'googleAppsScriptUrl';

// Get the URL from localStorage or fallback to empty string
const getGoogleAppsScriptUrl = (): string => {
  return localStorage.getItem(GOOGLE_APPS_SCRIPT_URL_KEY) || "";
};

// Set the Google Apps Script URL in localStorage
export const setGoogleAppsScriptUrl = (url: string): void => {
  localStorage.setItem(GOOGLE_APPS_SCRIPT_URL_KEY, url);
};

// Check if the Google Sheets integration is configured
export const isGoogleSheetsConfigured = (): boolean => {
  return !!getGoogleAppsScriptUrl();
};

/**
 * Syncs data with Google Sheets
 * @returns Promise with synced data
 */
export async function syncWithGoogleSheets(): Promise<{
  synced: boolean;
  data: CustomerWithDetails[];
}> {
  // First, try using our Express backend to sync
  try {
    const response = await apiRequest("GET", "/api/sheets/sync", undefined);
    return await response.json();
  } catch (error) {
    // If the Express backend fails, try direct Google Apps Script API
    try {
      const url = getGoogleAppsScriptUrl();
      if (!url) {
        throw new Error("Google Sheets URL not configured");
      }
      
      const response = await fetch(`${url}?action=getCustomers`);
      const data = await response.json();
      return {
        synced: true,
        data: data.customers,
      };
    } catch (googleError) {
      console.error("Failed to sync with Google Sheets:", googleError);
      throw new Error("Failed to sync with Google Sheets");
    }
  }
}

/**
 * Gets all customers from Google Sheets
 * @returns Promise with customers data
 */
export async function getGoogleSheetsCustomers(): Promise<Customer[]> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const url = `${scriptUrl}?action=getCustomers`;
  const response = await fetch(url);
  const data = await response.json();
  return data.customers || [];
}

/**
 * Gets a customer by ID from Google Sheets
 * @param id Customer ID
 * @returns Promise with customer data
 */
export async function getGoogleSheetsCustomerById(
  id: number,
): Promise<CustomerWithDetails | null> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const url = `${scriptUrl}?action=getCustomerById&id=${id}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.customer || null;
}

/**
 * Searches for a customer by query in Google Sheets
 * @param query Search query (ID or phone number)
 * @returns Promise with customer data
 */
export async function searchGoogleSheetsCustomer(
  query: string,
): Promise<CustomerWithDetails | null> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const url = `${scriptUrl}?action=searchCustomer&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.customer || null;
}

/**
 * Adds a new customer to Google Sheets
 * @param customer Customer data to add
 * @returns Promise with added customer data
 */
export async function addGoogleSheetsCustomer(
  customer: InsertCustomer,
): Promise<Customer> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "addCustomer",
      customer,
    }),
  });
  const data = await response.json();
  return data.customer;
}

/**
 * Updates a customer in Google Sheets
 * @param id Customer ID
 * @param customer Updated customer data
 * @returns Promise with updated customer data
 */
export async function updateGoogleSheetsCustomer(
  id: number,
  customer: Partial<InsertCustomer>,
): Promise<Customer> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "updateCustomer",
      id,
      customer,
    }),
  });
  const data = await response.json();
  return data.customer;
}

/**
 * Deletes a customer from Google Sheets
 * @param id Customer ID
 * @returns Promise with success message
 */
export async function deleteGoogleSheetsCustomer(
  id: number,
): Promise<{ success: boolean }> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "deleteCustomer",
      id,
    }),
  });
  const data = await response.json();
  return { success: data.success || false };
}

/**
 * Gets phone numbers for a customer from Google Sheets
 * @param customerId Customer ID
 * @returns Promise with phone numbers data
 */
export async function getGoogleSheetsPhones(
  customerId: number,
): Promise<PhoneNumber[]> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const url = `${scriptUrl}?action=getPhones&customerId=${customerId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.phoneNumbers || [];
}

/**
 * Adds a new phone number to Google Sheets
 * @param phone Phone number data to add
 * @returns Promise with added phone number data
 */
export async function addGoogleSheetsPhone(
  phone: InsertPhoneNumber,
): Promise<PhoneNumber> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "addPhone",
      phone,
    }),
  });
  const data = await response.json();
  return data.phone;
}

/**
 * Updates a phone number in Google Sheets
 * @param id Phone number ID
 * @param phone Updated phone number data
 * @returns Promise with updated phone number data
 */
export async function updateGoogleSheetsPhone(
  id: number,
  phone: Partial<InsertPhoneNumber>,
): Promise<PhoneNumber> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "updatePhone",
      id,
      phone,
    }),
  });
  const data = await response.json();
  return data.phone;
}

/**
 * Deletes a phone number from Google Sheets
 * @param id Phone number ID
 * @returns Promise with success message
 */
export async function deleteGoogleSheetsPhone(
  id: number,
): Promise<{ success: boolean }> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "deletePhone",
      id,
    }),
  });
  const data = await response.json();
  return { success: data.success || false };
}

/**
 * Gets services for a customer from Google Sheets
 * @param customerId Customer ID
 * @returns Promise with services data
 */
export async function getGoogleSheetsServices(
  customerId: number,
): Promise<Service[]> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const url = `${scriptUrl}?action=getServices&customerId=${customerId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.services || [];
}

/**
 * Adds a new service to Google Sheets
 * @param service Service data to add
 * @returns Promise with added service data
 */
export async function addGoogleSheetsService(
  service: InsertService,
): Promise<Service> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "addService",
      service,
    }),
  });
  const data = await response.json();
  return data.service;
}

/**
 * Updates a service in Google Sheets
 * @param id Service ID
 * @param service Updated service data
 * @returns Promise with updated service data
 */
export async function updateGoogleSheetsService(
  id: number,
  service: Partial<InsertService>,
): Promise<Service> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "updateService",
      id,
      service,
    }),
  });
  const data = await response.json();
  return data.service;
}

/**
 * Deletes a service from Google Sheets
 * @param id Service ID
 * @returns Promise with success message
 */
export async function deleteGoogleSheetsService(
  id: number,
): Promise<{ success: boolean }> {
  const scriptUrl = getGoogleAppsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets URL not configured");
  }
  
  const response = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "deleteService",
      id,
    }),
  });
  const data = await response.json();
  return { success: data.success || false };
}

/**
 * Creates a formatted phone number for WhatsApp links
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  // Remove all non-digit characters
  return phoneNumber.replace(/\D/g, "");
}

/**
 * Creates a WhatsApp link from a phone number
 * @param phoneNumber The phone number to create a link for
 * @returns WhatsApp URL
 */
export function createWhatsAppLink(phoneNumber: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  return `https://wa.me/${formattedPhone}`;
}
