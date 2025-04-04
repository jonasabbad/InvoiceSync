# Customer Invoice Management System

A web application for managing customer information, phone numbers, and service data with Google Sheets integration.

## Features

- Customer management (add, edit, delete customers)
- Phone number management with WhatsApp integration
- Service and code tracking
- Google Sheets integration for data storage
- Responsive design for mobile and desktop

## Deployment to GitHub & Vercel

### GitHub Setup

1. Create a new GitHub repository
2. Push your code to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Vercel Deployment

1. Sign up for a Vercel account: https://vercel.com/signup
2. Connect your GitHub account to Vercel
3. Import your repository from GitHub
4. Configure the project:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add any necessary environment variables
5. Deploy the project

## Google Sheets Integration

To configure Google Sheets integration:

1. Create a Google Apps Script project
2. Copy the code from the `google-apps-script/Code.gs` file
3. Deploy the script as a web app
4. Copy the web app URL
5. In the application, go to Settings and paste the URL in the Google Sheets configuration section

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the displayed URL

## Technologies Used

- React
- TypeScript
- Express
- Tailwind CSS
- shadcn/ui
- Google Sheets API
- Vercel for hosting