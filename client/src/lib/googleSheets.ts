import { apiRequest } from "./queryClient";
import { CustomerWithDetails } from "@shared/schema";

// This module would interact with the Google Sheets API
// For the purposes of this application, we'll make API calls to our backend
// which would handle the actual interaction with Google Sheets

/**
 * Syncs data with Google Sheets
 * @returns Promise with synced data
 */
export async function syncWithGoogleSheets(): Promise<{
  synced: boolean;
  data: CustomerWithDetails[];
}> {
  const response = await apiRequest("GET", "/api/sheets/sync", undefined);
  return await response.json();
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
