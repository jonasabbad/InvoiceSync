import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-primary-600">Invoice Manager</span>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <span className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">Dashboard</span>
              </Link>
              <Link href="/customers">
                <span className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">Customers</span>
              </Link>
              <Link href="/">
                <span className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">Invoices</span>
              </Link>
              <Link href="/">
                <span className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">Reports</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button type="button" className="p-1 rounded-full text-slate-600 hover:text-primary-600 focus:outline-none">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <Link href="/settings">
              <button type="button" className="p-1 rounded-full text-slate-600 hover:text-primary-600 focus:outline-none">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </Link>
            <div className="relative">
              <button type="button" className="flex items-center max-w-xs rounded-full focus:outline-none">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User profile" 
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden px-4 pb-3">
        <button 
          type="button" 
          className="text-slate-600 hover:text-primary-600 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-2 pt-2 pb-3 space-y-1">
          <Link href="/">
            <span className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer">Dashboard</span>
          </Link>
          <Link href="/customers">
            <span className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer">Customers</span>
          </Link>
          <Link href="/">
            <span className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer">Invoices</span>
          </Link>
          <Link href="/">
            <span className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer">Reports</span>
          </Link>
          <Link href="/settings">
            <span className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer">Settings</span>
          </Link>
        </div>
      )}
    </header>
  );
}
