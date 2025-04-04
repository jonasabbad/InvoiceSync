import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerWithDetails, PhoneNumber } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { createWhatsAppLink } from "@/lib/googleSheets";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CustomerDetailsProps {
  customer: CustomerWithDetails;
  onEditPhoneNumber: () => void;
  onAddPhoneNumber: () => void;
}

export default function CustomerDetails({
  customer,
  onEditPhoneNumber,
  onAddPhoneNumber
}: CustomerDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneNumber | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: number) => {
      await apiRequest("DELETE", `/api/customers/${customerId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deletePhoneNumberMutation = useMutation({
    mutationFn: async (phoneId: number) => {
      await apiRequest("DELETE", `/api/phones/${phoneId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id] });
      toast({
        title: "Phone number deleted",
        description: "Phone number has been deleted successfully.",
        variant: "success",
      });
      setPhoneToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete phone number. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteCustomer = () => {
    deleteCustomerMutation.mutate(customer.id);
  };

  const handleDeletePhoneNumber = (phone: PhoneNumber) => {
    setPhoneToDelete(phone);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePhoneNumber = () => {
    if (phoneToDelete) {
      deletePhoneNumberMutation.mutate(phoneToDelete.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-200">
        <CardTitle className="text-lg font-medium text-slate-800">Customer Details</CardTitle>
        <div className="flex space-x-2">
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-slate-600 bg-slate-100 hover:bg-slate-200">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="sr-only">Edit Customer</span>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-9 w-9 rounded-full text-red-600 bg-red-100 hover:bg-red-200"
            onClick={handleDeleteCustomer}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span className="sr-only">Delete Customer</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 py-5">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
              <div className="text-sm text-slate-900 font-medium">{customer.id}</div>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <div className="text-sm text-slate-900 font-medium">{customer.name}</div>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Person</label>
              <div className="text-sm text-slate-900 font-medium">{customer.responsible || "Not specified"}</div>
            </div>
          </div>
          
          <div>
            <div className="mb-3 flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">Phone Numbers</label>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2.5 py-1.5 text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                onClick={onAddPhoneNumber}
              >
                <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Number
              </Button>
            </div>
            
            {(!customer.phoneNumbers || customer.phoneNumbers.length === 0) ? (
              <div className="p-4 text-center bg-slate-50 rounded-md">
                <p className="text-sm text-slate-500">No phone numbers added yet.</p>
              </div>
            ) : (
              customer.phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md mb-2">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{phone.number}</p>
                      <div className="mt-1 flex items-center">
                        {phone.isPrimary && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Primary</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <a
                      href={createWhatsAppLink(phone.number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none"
                      title="WhatsApp"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </a>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 p-1.5 rounded-full text-primary-600 bg-primary-100 hover:bg-primary-200"
                      onClick={onEditPhoneNumber}
                      title="Edit"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 p-1.5 rounded-full text-red-600 bg-red-100 hover:bg-red-200"
                      onClick={() => handleDeletePhoneNumber(phone)}
                      title="Delete"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      {/* Delete Phone Number Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this phone number? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePhoneNumber}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
