# Deployment Guide for Customer Invoice Management System

This guide will walk you through deploying the Customer Invoice Management System to GitHub and Vercel.

## 1. Prepare Google Sheets Integration

### Set Up Google Sheets

1. Create a new Google Sheets document with three sheets:
   - **Customers** - with headers: id, name, responsible, address, email
   - **PhoneNumbers** - with headers: id, customerId, number, isPrimary
   - **Services** - with headers: id, customerId, name, code, notes

2. Note the Spreadsheet ID from the URL (the long string between `/d/` and `/edit` in your Google Sheets URL).

### Set Up Google Apps Script

1. Open your Google Sheets document
2. Go to Extensions > Apps Script
3. Replace the code in the script editor with the code from `google-apps-script/Code.gs`
4. Update the `SPREADSHEET_ID` constant on line 8 with your own spreadsheet ID
5. Save the project (name it "Customer Invoice Management")
6. Deploy it as a web app:
   - Click "Deploy" > "New deployment"
   - Select Type: "Web app"
   - Set "Execute as": "Me"
   - Set "Who has access": "Anyone"
   - Click "Deploy"
   - Copy the Web app URL - you'll need it for the application

## 2. Deploy to GitHub

1. Create a new GitHub repository at https://github.com/new
2. Initialize Git and push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 3. Deploy to Vercel

### Preparation

1. Sign up for a Vercel account at https://vercel.com/signup (you can use your GitHub account)
2. Install the Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

### Deploy with Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. The project should be configured automatically through the vercel.json file with:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add Environment Variables (optional):
   - NODE_ENV: production
5. Click "Deploy"

Note: The repository already includes a vercel.json configuration file that handles all the necessary settings for deployment.

### Deploy with Vercel CLI (Alternative)

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy from your project directory:
   ```bash
   vercel
   ```

3. Follow the prompts to configure your project

## 4. Configure the Deployed Application

1. Open your deployed application
2. Go to the Settings page
3. In the "Google Sheets Configuration" section, enter the Web app URL from your Google Apps Script deployment
4. Click "Save Configuration"
5. Test the application by adding a customer and verifying it appears in your Google Sheets

## Troubleshooting

### Google Sheets Integration Issues

- Make sure your Google Apps Script is deployed as a web app with "Anyone" access
- Check that the correct Google Sheets URL is set in the application settings
- Verify that your Google Sheets document has the correct sheet names and column headers

### Vercel Deployment Issues

- Check the build logs for any errors
- Make sure all dependencies are correctly installed
- Verify that environment variables are set correctly

## Updating Your Deployment

When you make changes to your code:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. Vercel will automatically redeploy your application if you've set up automatic deployments.