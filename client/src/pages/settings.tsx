import React from "react";
import GoogleSheetsSettings from "@/components/settings/GoogleSheetsSettings";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure your application settings</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <GoogleSheetsSettings />
      </div>
    </div>
  );
}