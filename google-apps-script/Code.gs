/**
 * Customer Invoice Management - Google Apps Script Backend
 * This script serves as the backend for the Customer Invoice Management web application
 * It provides API endpoints to interact with Google Sheets as a database
 */

// Configuration
const SPREADSHEET_ID = ''; // Replace with your actual spreadsheet ID
const CUSTOMERS_SHEET_NAME = 'Customers';
const PHONES_SHEET_NAME = 'PhoneNumbers';
const SERVICES_SHEET_NAME = 'Services';

/**
 * Set up the web app
 * @returns {Object} JSON response object
 */
function doGet(e) {
  const params = e.parameter;
  let result;
  
  // Route to appropriate handler based on the action parameter
  switch (params.action) {
    case 'getCustomers':
      result = getAllCustomers();
      break;
    case 'getCustomerById':
      result = getCustomerById(params.id);
      break;
    case 'searchCustomer':
      result = searchCustomer(params.query);
      break;
    case 'getPhones':
      result = getPhones(params.customerId);
      break;
    case 'getServices':
      result = getServices(params.customerId);
      break;
    default:
      result = { error: 'Invalid action' };
  }
  
  // Return JSON response
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests for creating/updating data
 * @returns {Object} JSON response object
 */
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  let result;
  
  // Route to appropriate handler based on the action parameter
  switch (params.action) {
    case 'addCustomer':
      result = addCustomer(params.customer);
      break;
    case 'updateCustomer':
      result = updateCustomer(params.id, params.customer);
      break;
    case 'deleteCustomer':
      result = deleteCustomer(params.id);
      break;
    case 'addPhone':
      result = addPhone(params.phone);
      break;
    case 'updatePhone':
      result = updatePhone(params.id, params.phone);
      break;
    case 'deletePhone':
      result = deletePhone(params.id);
      break;
    case 'addService':
      result = addService(params.service);
      break;
    case 'updateService':
      result = updateService(params.id, params.service);
      break;
    case 'deleteService':
      result = deleteService(params.id);
      break;
    default:
      result = { error: 'Invalid action' };
  }
  
  // Return JSON response
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Gets all customers from the sheet
 * @returns {Object} Object with customers array
 */
function getAllCustomers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CUSTOMERS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Start from row 1 (skip headers) and convert to objects
  const customers = data.slice(1).map(row => {
    const customer = {};
    headers.forEach((header, i) => {
      customer[header] = row[i];
    });
    return customer;
  });
  
  return { customers };
}

/**
 * Gets a customer by ID
 * @param {string} id Customer ID
 * @returns {Object} Customer data with phone numbers and services
 */
function getCustomerById(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const customerSheet = ss.getSheetByName(CUSTOMERS_SHEET_NAME);
  const customerData = customerSheet.getDataRange().getValues();
  const customerHeaders = customerData[0];
  
  // Find customer by ID
  const customerRow = customerData.slice(1).find(row => String(row[0]) === String(id));
  
  if (!customerRow) {
    return { error: 'Customer not found' };
  }
  
  // Convert row to object
  const customer = {};
  customerHeaders.forEach((header, i) => {
    customer[header] = customerRow[i];
  });
  
  // Get phone numbers for this customer
  customer.phoneNumbers = getPhones(id).phoneNumbers || [];
  
  // Get services for this customer
  customer.services = getServices(id).services || [];
  
  return { customer };
}

/**
 * Searches for a customer by ID or phone number
 * @param {string} query Search query (ID or phone number)
 * @returns {Object} Customer data if found
 */
function searchCustomer(query) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // First try to find by ID
  const customerById = getCustomerById(query);
  if (!customerById.error) {
    return customerById;
  }
  
  // Then try to find by phone number
  const phoneSheet = ss.getSheetByName(PHONES_SHEET_NAME);
  const phoneData = phoneSheet.getDataRange().getValues();
  const phoneHeaders = phoneData[0];
  
  // Find phone by number
  const phoneRow = phoneData.slice(1).find(row => {
    const phoneNumber = String(row[phoneHeaders.indexOf('number')]);
    return phoneNumber === query || phoneNumber.includes(query);
  });
  
  if (!phoneRow) {
    return { error: 'Customer not found' };
  }
  
  // Get the customer ID from the phone row
  const customerId = phoneRow[phoneHeaders.indexOf('customerId')];
  
  // Return the customer
  return getCustomerById(customerId);
}

/**
 * Gets phone numbers for a customer
 * @param {string} customerId Customer ID
 * @returns {Object} Object with phoneNumbers array
 */
function getPhones(customerId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(PHONES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter phones by customer ID and convert to objects
  const phoneNumbers = data.slice(1)
    .filter(row => String(row[headers.indexOf('customerId')]) === String(customerId))
    .map(row => {
      const phone = {};
      headers.forEach((header, i) => {
        phone[header] = row[i];
      });
      return phone;
    });
  
  return { phoneNumbers };
}

/**
 * Gets services for a customer
 * @param {string} customerId Customer ID
 * @returns {Object} Object with services array
 */
function getServices(customerId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SERVICES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter services by customer ID and convert to objects
  const services = data.slice(1)
    .filter(row => String(row[headers.indexOf('customerId')]) === String(customerId))
    .map(row => {
      const service = {};
      headers.forEach((header, i) => {
        service[header] = row[i];
      });
      return service;
    });
  
  return { services };
}

/**
 * Adds a new customer
 * @param {Object} customer Customer data
 * @returns {Object} Added customer data
 */
function addCustomer(customer) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CUSTOMERS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Create a new customer ID (max existing ID + 1)
  const idIndex = headers.indexOf('id');
  const maxId = data.slice(1).reduce((max, row) => Math.max(max, row[idIndex] || 0), 0);
  const newId = maxId + 1;
  
  // Prepare row values in the same order as headers
  const newRow = headers.map(header => {
    if (header === 'id') return newId;
    if (header === 'createdAt') return new Date();
    return customer[header] || null;
  });
  
  // Add new row
  sheet.appendRow(newRow);
  
  // Return the added customer with ID
  return { 
    customer: { 
      ...customer, 
      id: newId,
      phoneNumbers: [],
      services: []
    } 
  };
}

/**
 * Updates a customer
 * @param {string} id Customer ID
 * @param {Object} customer Updated customer data
 * @returns {Object} Updated customer data
 */
function updateCustomer(id, customer) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CUSTOMERS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find customer row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Customer not found' };
  }
  
  // Update customer data
  headers.forEach((header, i) => {
    if (header !== 'id' && header !== 'createdAt' && customer[header] !== undefined) {
      data[rowIndex][i] = customer[header];
    }
  });
  
  // Update row in sheet
  const range = sheet.getRange(rowIndex + 1, 1, 1, headers.length);
  range.setValues([data[rowIndex]]);
  
  // Return updated customer with details
  return getCustomerById(id);
}

/**
 * Deletes a customer
 * @param {string} id Customer ID
 * @returns {Object} Success message
 */
function deleteCustomer(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CUSTOMERS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Find customer row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Customer not found' };
  }
  
  // Delete row
  sheet.deleteRow(rowIndex + 1);
  
  // Also delete associated phone numbers and services
  deleteAssociatedPhones(id);
  deleteAssociatedServices(id);
  
  return { success: true, message: 'Customer deleted successfully' };
}

/**
 * Deletes all phone numbers for a customer
 * @param {string} customerId Customer ID
 */
function deleteAssociatedPhones(customerId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(PHONES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const customerIdIndex = headers.indexOf('customerId');
  
  // Find all rows to delete (in reverse order to avoid index shifting issues)
  const rowsToDelete = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][customerIdIndex]) === String(customerId)) {
      rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
    }
  }
  
  // Delete rows in reverse order
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    sheet.deleteRow(rowsToDelete[i]);
  }
}

/**
 * Deletes all services for a customer
 * @param {string} customerId Customer ID
 */
function deleteAssociatedServices(customerId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SERVICES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const customerIdIndex = headers.indexOf('customerId');
  
  // Find all rows to delete (in reverse order to avoid index shifting issues)
  const rowsToDelete = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][customerIdIndex]) === String(customerId)) {
      rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
    }
  }
  
  // Delete rows in reverse order
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    sheet.deleteRow(rowsToDelete[i]);
  }
}

/**
 * Adds a new phone number
 * @param {Object} phone Phone number data
 * @returns {Object} Added phone number data
 */
function addPhone(phone) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(PHONES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Create a new phone ID (max existing ID + 1)
  const idIndex = headers.indexOf('id');
  const maxId = data.slice(1).reduce((max, row) => Math.max(max, row[idIndex] || 0), 0);
  const newId = maxId + 1;
  
  // Prepare row values in the same order as headers
  const newRow = headers.map(header => {
    if (header === 'id') return newId;
    if (header === 'createdAt') return new Date();
    return phone[header] || null;
  });
  
  // Add new row
  sheet.appendRow(newRow);
  
  // Return the added phone with ID
  return { phone: { ...phone, id: newId } };
}

/**
 * Updates a phone number
 * @param {string} id Phone number ID
 * @param {Object} phone Updated phone number data
 * @returns {Object} Updated phone number data
 */
function updatePhone(id, phone) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(PHONES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find phone row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Phone number not found' };
  }
  
  // Update phone data
  headers.forEach((header, i) => {
    if (header !== 'id' && header !== 'createdAt' && phone[header] !== undefined) {
      data[rowIndex][i] = phone[header];
    }
  });
  
  // Update row in sheet
  const range = sheet.getRange(rowIndex + 1, 1, 1, headers.length);
  range.setValues([data[rowIndex]]);
  
  // Get the customerId to return with full customer data
  const customerId = data[rowIndex][headers.indexOf('customerId')];
  
  // Return the updated phone
  return { 
    phone: headers.reduce((obj, header, i) => {
      obj[header] = data[rowIndex][i];
      return obj;
    }, {})
  };
}

/**
 * Deletes a phone number
 * @param {string} id Phone number ID
 * @returns {Object} Success message
 */
function deletePhone(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(PHONES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Find phone row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Phone number not found' };
  }
  
  // Delete row
  sheet.deleteRow(rowIndex + 1);
  
  return { success: true, message: 'Phone number deleted successfully' };
}

/**
 * Adds a new service
 * @param {Object} service Service data
 * @returns {Object} Added service data
 */
function addService(service) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SERVICES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Create a new service ID (max existing ID + 1)
  const idIndex = headers.indexOf('id');
  const maxId = data.slice(1).reduce((max, row) => Math.max(max, row[idIndex] || 0), 0);
  const newId = maxId + 1;
  
  // Prepare row values in the same order as headers
  const newRow = headers.map(header => {
    if (header === 'id') return newId;
    if (header === 'createdAt') return new Date();
    return service[header] || null;
  });
  
  // Add new row
  sheet.appendRow(newRow);
  
  // Return the added service with ID
  return { service: { ...service, id: newId } };
}

/**
 * Updates a service
 * @param {string} id Service ID
 * @param {Object} service Updated service data
 * @returns {Object} Updated service data
 */
function updateService(id, service) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SERVICES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find service row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Service not found' };
  }
  
  // Update service data
  headers.forEach((header, i) => {
    if (header !== 'id' && header !== 'createdAt' && service[header] !== undefined) {
      data[rowIndex][i] = service[header];
    }
  });
  
  // Update row in sheet
  const range = sheet.getRange(rowIndex + 1, 1, 1, headers.length);
  range.setValues([data[rowIndex]]);
  
  // Return the updated service
  return { 
    service: headers.reduce((obj, header, i) => {
      obj[header] = data[rowIndex][i];
      return obj;
    }, {})
  };
}

/**
 * Deletes a service
 * @param {string} id Service ID
 * @returns {Object} Success message
 */
function deleteService(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SERVICES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Find service row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Service not found' };
  }
  
  // Delete row
  sheet.deleteRow(rowIndex + 1);
  
  return { success: true, message: 'Service deleted successfully' };
}

/**
 * Creates a new Google Sheets database if it doesn't exist
 */
function initializeDatabase() {
  // Check if spreadsheet exists
  let ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    // Create a new spreadsheet
    ss = SpreadsheetApp.create('Customer Invoice Management Database');
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  }
  
  // Create Customers sheet if it doesn't exist
  let customersSheet = ss.getSheetByName(CUSTOMERS_SHEET_NAME);
  if (!customersSheet) {
    customersSheet = ss.insertSheet(CUSTOMERS_SHEET_NAME);
    // Add headers
    customersSheet.appendRow(['id', 'name', 'responsible', 'createdAt']);
  }
  
  // Create PhoneNumbers sheet if it doesn't exist
  let phonesSheet = ss.getSheetByName(PHONES_SHEET_NAME);
  if (!phonesSheet) {
    phonesSheet = ss.insertSheet(PHONES_SHEET_NAME);
    // Add headers
    phonesSheet.appendRow(['id', 'customerId', 'number', 'isPrimary', 'createdAt']);
  }
  
  // Create Services sheet if it doesn't exist
  let servicesSheet = ss.getSheetByName(SERVICES_SHEET_NAME);
  if (!servicesSheet) {
    servicesSheet = ss.insertSheet(SERVICES_SHEET_NAME);
    // Add headers
    servicesSheet.appendRow(['id', 'customerId', 'name', 'code', 'notes', 'createdAt']);
  }
  
  return { success: true, message: 'Database initialized successfully' };
}