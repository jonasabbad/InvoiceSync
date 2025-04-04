import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CustomerWithDetails } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();

  // Fetch customers for statistics
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<any[]>({
    queryKey: ["/api/customers"],
    initialData: [],
  });

  // Create statistics from data
  const totalCustomers = customers?.length || 0;
  const totalServices = customers?.reduce((total, customer) => {
    return total + (customer.services?.length || 0);
  }, 0) || 0;

  // Get recent customers
  const recentCustomers = [...(customers || [])]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome to your Invoice Manager dashboard</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Customers</CardTitle>
            <CardDescription>All registered customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600">
              {isLoadingCustomers ? "..." : totalCustomers}
            </div>
            <Link href="/customers">
              <span className="text-sm text-primary-600 hover:underline cursor-pointer mt-2 inline-block">
                View all customers →
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Services</CardTitle>
            <CardDescription>Services provided to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600">
              {isLoadingCustomers ? "..." : totalServices}
            </div>
            <Link href="/customers">
              <span className="text-sm text-primary-600 hover:underline cursor-pointer mt-2 inline-block">
                Manage services →
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/customers">
                <span className="block text-sm text-primary-600 hover:underline cursor-pointer">
                  Add new customer
                </span>
              </Link>
              <Link href="/settings">
                <span className="block text-sm text-primary-600 hover:underline cursor-pointer">
                  Configure Google Sheets
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>The most recently added customers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCustomers ? (
            <p>Loading recent customers...</p>
          ) : recentCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Responsible</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{customer.id}</td>
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.responsible || "-"}</td>
                      <td className="py-3 px-4">
                        <Link href={`/customers?id=${customer.id}`}>
                          <span className="text-primary-600 hover:underline cursor-pointer">View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">No customers found</p>
              <Link href="/customers">
                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                  Add Customer
                </button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
