import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertServiceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isGoogleSheetsConfigured } from "@/lib/googleSheets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters" }),
  code: z.string().min(3, { message: "Service code must be at least 3 characters" }),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function AddServiceModal({ isOpen, onClose, customerId }: AddServiceModalProps) {
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
      code: "",
      notes: ""
    }
  });

  const addServiceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const serviceData = insertServiceSchema.parse({
        customerId,
        name: data.name,
        code: data.code,
        notes: data.notes || undefined
      });
      
      const response = await apiRequest("POST", "/api/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId] });
      toast({
        title: "Service added",
        description: "Service has been added successfully.",
        variant: "success",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    addServiceMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        
        {!sheetsConfigured && (
          <Alert className="mb-4 bg-amber-50 border-amber-300">
            <AlertTitle>Google Sheets Not Configured</AlertTitle>
            <AlertDescription>
              Your Google Sheets integration is not set up. Service data will only be saved locally. 
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
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Electricity" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. ELEC-1001-A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Optional notes about the service"
                      rows={3}
                    />
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
