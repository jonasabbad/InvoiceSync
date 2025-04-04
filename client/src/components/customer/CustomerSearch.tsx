import { useState, useRef } from "react";
import { CustomerWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerSearchProps {
  customers: any[];
  isLoading: boolean;
  onCustomerSelect: (customerId: number | null) => void;
  onCustomerSearch: (customer: CustomerWithDetails | null) => void;
  onSyncDatabase: () => void;
}

export default function CustomerSearch({
  customers = [],
  isLoading,
  onCustomerSelect,
  onCustomerSearch,
  onSyncDatabase
}: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search query is empty, don't search
    if (!query.trim()) {
      return;
    }
    
    // Search after a short delay
    searchTimeoutRef.current = setTimeout(async () => {
      await searchCustomer(query);
    }, 500);
  };

  const handleSelectChange = (value: string) => {
    if (value && value !== "placeholder") {
      onCustomerSelect(parseInt(value));
    } else {
      onCustomerSelect(null);
    }
    // Clear search when selecting a customer
    setSearchQuery("");
  };

  const searchCustomer = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await apiRequest("GET", `/api/customers/search/${query}`, undefined);
      const customer = await response.json();
      
      // Ensure phoneNumbers and services are initialized
      const completeCustomer = {
        ...customer,
        phoneNumbers: customer.phoneNumbers || [],
        services: customer.services || []
      };
      
      onCustomerSearch(completeCustomer);
      toast({
        title: "Customer Found",
        description: `Found customer: ${customer.name}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Customer Not Found",
        description: "No customer found with the provided ID or phone number.",
        variant: "destructive",
      });
      onCustomerSearch(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <label htmlFor="search" className="block text-sm font-medium text-slate-700">Search Customer</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <Input
              type="text"
              name="search"
              id="search"
              className="pl-10"
              placeholder="Search by ID or phone number"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={isSearching}
            />
          </div>
        </div>
        
        <div className="md:col-span-5">
          <label htmlFor="customer-select" className="block text-sm font-medium text-slate-700">Select Customer</label>
          {isLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : (
            <Select onValueChange={handleSelectChange} defaultValue="placeholder">
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">Select a customer</SelectItem>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name} (ID: {customer.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="md:col-span-2 flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={onSyncDatabase}
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
            Sync
          </Button>
        </div>
      </div>
    </div>
  );
}
