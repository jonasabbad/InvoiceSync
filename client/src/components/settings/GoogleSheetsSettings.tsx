import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Key for storing the Google Apps Script URL in local storage
const GOOGLE_APPS_SCRIPT_URL_KEY = 'googleAppsScriptUrl';

export default function GoogleSheetsSettings() {
  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState('settings');
  const { toast } = useToast();

  // Load saved URL from local storage on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(GOOGLE_APPS_SCRIPT_URL_KEY);
    if (savedUrl) {
      setGoogleAppsScriptUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    // Save URL to local storage
    localStorage.setItem(GOOGLE_APPS_SCRIPT_URL_KEY, googleAppsScriptUrl);
    
    // Update our integration
    window.location.reload(); // Reload the page to apply the new URL
    
    toast({
      title: "Settings Saved",
      description: "Google Sheets API URL has been saved successfully.",
      variant: "success",
    });
    
    setIsEditing(false);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="guide">Setup Guide</TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Google Sheets Integration</CardTitle>
            <CardDescription>
              Configure your Google Sheets API connection for storing customer data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="google-apps-script-url">Google Apps Script Web App URL</Label>
                <Input
                  id="google-apps-script-url"
                  placeholder="https://script.google.com/macros/s/..."
                  value={googleAppsScriptUrl}
                  onChange={(e) => setGoogleAppsScriptUrl(e.target.value)}
                  disabled={!isEditing}
                />
                <p className="text-sm text-slate-500">
                  Enter the deployed URL of your Google Apps Script web application
                </p>
              </div>
              
              {googleAppsScriptUrl && !isEditing && (
                <Alert className="bg-green-50 border-green-300">
                  <AlertTitle>Connection Configured</AlertTitle>
                  <AlertDescription>
                    Your Google Sheets integration is configured. Click Edit to change the URL.
                  </AlertDescription>
                </Alert>
              )}
              
              {!googleAppsScriptUrl && (
                <Alert className="bg-amber-50 border-amber-300">
                  <AlertTitle>Setup Required</AlertTitle>
                  <AlertDescription>
                    You need to set up your Google Sheets integration. Follow the guide in the Setup Guide tab.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setTab('guide')}>View Setup Guide</Button>
                <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
              </>
            )}
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="guide">
        <Card>
          <CardHeader>
            <CardTitle>Setup Guide</CardTitle>
            <CardDescription>
              Follow these steps to set up your Google Sheets integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 1: Create a Google Sheet</h3>
              <p className="text-slate-600">
                Create a new Google Sheet to store your customer data. You can name it anything, 
                such as "Customer Invoice Management Database".
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 2: Open Google Apps Script</h3>
              <p className="text-slate-600">
                In your Google Sheet, click on "Extensions" then "Apps Script". This will open the Apps Script editor.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 3: Copy and Paste the Code</h3>
              <p className="text-slate-600">
                Delete any code in the editor and copy-paste the entire code from the
                {' '}<code className="px-1 py-0.5 bg-slate-100 rounded">google-apps-script/Code.gs</code> file in this project.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 4: Update Spreadsheet ID</h3>
              <p className="text-slate-600">
                Find the spreadsheet ID in your Google Sheet's URL. It's the long string of characters 
                in the URL between /d/ and /edit. Replace the empty SPREADSHEET_ID value in the code with your ID.
              </p>
              <pre className="p-2 bg-slate-100 rounded overflow-x-auto">
                <code>{`const SPREADSHEET_ID = 'your-spreadsheet-id-here';`}</code>
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 5: Deploy the Web App</h3>
              <p className="text-slate-600">
                Click on the "Deploy" button, select "New deployment", and set the following options:
              </p>
              <ul className="list-disc pl-6 text-slate-600">
                <li>Type: "Web app"</li>
                <li>Execute as: "Me"</li>
                <li>Who has access: "Anyone" (or "Anyone with Google account" for more security)</li>
              </ul>
              <p className="text-slate-600">
                Click "Deploy" and authorize the app when prompted.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 6: Copy the Web App URL</h3>
              <p className="text-slate-600">
                After deployment, you'll get a URL. Copy this URL and paste it in the Settings tab.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 7: Initialize the Database</h3>
              <p className="text-slate-600">
                In the Apps Script editor, select the function 'initializeDatabase' and click the "Run" button.
                This will create the necessary sheets and columns in your Google Sheet.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setTab('settings')}>Back to Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}