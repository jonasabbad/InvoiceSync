import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertCustomerSchema, insertPhoneNumberSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isGoogleSheetsConfigured } from "@/lib/googleSheets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  responsible: z.string().optional(),
  phoneNumber: z.string().min(9, { message: "Phone number must be valid" })
});

type FormValues = z.infer<typeof formSchema>;

export default function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetsConfigured, setSheetsConfigured] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if Google Sheets is configured
  useEffect(() => {
    setSheetsConfigured(isGoogleSheetsConfigured());
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      responsible: "",
      phoneNumber: ""
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Create the customer
      const customerData = insertCustomerSchema.parse({
        name: data.name,
        responsible: data.responsible || undefined
      });
      
      const response = await apiRequest("POST", "/api/customers", customerData);
      const newCustomer = await response.json();
      
      // Add phone number if provided
      if (data.phoneNumber.trim()) {
        const phoneData = insertPhoneNumberSchema.parse({
          customerId: newCustomer.id,
          number: data.phoneNumber,
          isPrimary: true // First phone is primary
        });
        
        await apiRequest("POST", "/api/phones", phoneData);
      }
      
      return newCustomer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer added",
        description: "Customer has been added successfully.",
        variant: "success",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    addCustomerMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        
        {!sheetsConfigured && (
          <Alert className="mb-4 bg-amber-50 border-amber-300">
            <AlertTitle>Google Sheets Not Configured</AlertTitle>
            <AlertDescription>
              Your Google Sheets integration is not set up. Customer data will only be saved locally. 
              <Link to="/settings" className="text-blue-500 hover:underline ml-1">
                Configure Google Sheets
              </Link>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsible Person</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+966 5X XXX XXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
