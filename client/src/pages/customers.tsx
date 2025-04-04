import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import CustomerSearch from "@/components/customer/CustomerSearch";
import CustomerDetails from "@/components/customer/CustomerDetails";
import ServicesTable from "@/components/services/ServicesTable";
import AddCustomerModal from "@/components/customer/AddCustomerModal";
import AddPhoneModal from "@/components/customer/AddPhoneModal";
import AddServiceModal from "@/components/services/AddServiceModal";
import { CustomerWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAddPhoneModalOpen, setIsAddPhoneModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Check for customer ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('id');
    
    if (customerId) {
      setSelectedCustomerId(parseInt(customerId, 10));
    }
  }, [location]);

  // Fetch customers for dropdown
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<any[]>({
    queryKey: ["/api/customers"],
    initialData: [],
  });

  // Fetch selected customer details
  const { data: selectedCustomer, isLoading: isLoadingSelectedCustomer } = useQuery<CustomerWithDetails>({
    queryKey: ["/api/customers", selectedCustomerId],
    enabled: !!selectedCustomerId,
    // Provide an empty array for phoneNumbers and services to prevent null/undefined errors
    select: (data) => {
      return {
        ...data,
        phoneNumbers: data.phoneNumbers || [],
        services: data.services || []
      };
    }
  });

  const handleCustomerSelect = (customerId: number | null) => {
    setSelectedCustomerId(customerId);
  };

  const handleCustomerSearch = (customer: CustomerWithDetails | null) => {
    if (customer) {
      // Set the selected customer
      setSelectedCustomerId(customer.id);
      // Update the cache with the search result
      queryClient.setQueryData(["/api/customers", customer.id], customer);
    }
  };

  const handleSyncDatabase = async () => {
    try {
      // Trigger a refetch of all customer data
      await queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      
      toast({
        title: "Sync Complete",
        description: "Customer data has been synced successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync customer data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Customer Search Section */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-800">Customer Management</h1>
            <p className="mt-1 text-sm text-slate-500">Search, view, and manage customer information</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setIsAddCustomerModalOpen(true)}
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="16" y1="11" x2="22" y2="11" />
              </svg>
              Add Customer
            </button>
          </div>
        </div>

        <CustomerSearch
          customers={customers}
          isLoading={isLoadingCustomers}
          onCustomerSelect={handleCustomerSelect}
          onCustomerSearch={handleCustomerSearch}
          onSyncDatabase={handleSyncDatabase}
        />
      </div>

      {/* Customer Details */}
      {selectedCustomerId ? (
        isLoadingSelectedCustomer ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 p-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-6" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-6" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-20 w-full mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ) : (
          selectedCustomer && (
            <CustomerDetails
              customer={selectedCustomer}
              onEditPhoneNumber={() => setIsAddPhoneModalOpen(true)}
              onAddPhoneNumber={() => setIsAddPhoneModalOpen(true)}
            />
          )
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="text-center py-8">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customer selected</h3>
            <p className="mt-1 text-sm text-gray-500">Select a customer from the dropdown or search for one.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setIsAddCustomerModalOpen(true)}
              >
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="16" y1="11" x2="22" y2="11" />
                </svg>
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      {selectedCustomerId && selectedCustomer && (
        <ServicesTable
          customerId={selectedCustomerId}
          services={selectedCustomer.services}
          onAddService={() => setIsAddServiceModalOpen(true)}
        />
      )}

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
      />
      
      {selectedCustomerId && (
        <>
          <AddPhoneModal
            isOpen={isAddPhoneModalOpen}
            onClose={() => setIsAddPhoneModalOpen(false)}
            customerId={selectedCustomerId}
          />
          
          <AddServiceModal
            isOpen={isAddServiceModalOpen}
            onClose={() => setIsAddServiceModalOpen(false)}
            customerId={selectedCustomerId}
          />
        </>
      )}
    </div>
  );
}