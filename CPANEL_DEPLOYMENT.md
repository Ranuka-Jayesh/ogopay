# cPanel Deployment Guide

This guide will help you deploy your Vite React TypeScript application to cPanel hosting.

## Prerequisites

1. A cPanel hosting account
2. Node.js installed locally (for building the project)
3. FTP/SFTP access to your hosting account

## Step 1: Build Your Project

First, build your project locally:

```bash
# Install dependencies (if not already done)
npm install

# Build the project for production
npm run build
```

This will create a `dist` folder with your optimized production files.

## Step 2: Upload Files to cPanel

### Option A: Using cPanel File Manager

1. Log into your cPanel account
2. Open the **File Manager**
3. Navigate to your domain's public directory (usually `public_html` or `www`)
4. Upload all contents from your local `dist` folder to this directory
5. Upload the `.htaccess` file to the same directory

### Option B: Using FTP/SFTP

1. Use an FTP client (like FileZilla, WinSCP, or Cyberduck)
2. Connect to your hosting server using your FTP credentials
3. Navigate to your domain's public directory
4. Upload all contents from your local `dist` folder
5. Upload the `.htaccess` file

## Step 3: File Structure

Your cPanel directory should look like this:

```
public_html/
├── .htaccess
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── [other static files]
```

## Step 4: Verify Configuration

1. Visit your website to ensure it loads correctly
2. Test your routes to make sure client-side routing works
3. Check that the `/track/*` routes work as expected

## Important Notes

### .htaccess File
The `.htaccess` file I created includes:
- **SPA Routing**: Handles client-side routing for your React app
- **Security Headers**: Adds security headers to protect your site
- **Compression**: Enables gzip compression for better performance
- **Caching**: Sets up caching for static assets
- **Security**: Prevents access to sensitive files

### Environment Variables
If your app uses environment variables, you'll need to:
1. Create a `.env` file in your cPanel directory
2. Add your environment variables there
3. Make sure your build process includes these variables

### Database Configuration
If you're using Supabase (as indicated in your package.json):
1. Ensure your Supabase URL and API keys are correctly configured
2. Update any environment variables in your production build
3. Test database connections from your hosted site

## Troubleshooting

### Common Issues

1. **404 Errors on Routes**: Make sure the `.htaccess` file is uploaded and Apache mod_rewrite is enabled
2. **Assets Not Loading**: Check that all files from the `dist` folder were uploaded
3. **CORS Issues**: If you have API calls, ensure your Supabase configuration allows your domain

### Checking Apache Modules

If you have access to cPanel's Apache Configuration:
- Ensure `mod_rewrite` is enabled
- Ensure `mod_headers` is enabled
- Ensure `mod_deflate` is enabled
- Ensure `mod_expires` is enabled

### Testing

After deployment, test:
- ✅ Homepage loads
- ✅ All routes work (including `/track/*`)
- ✅ Assets load correctly
- ✅ API calls work
- ✅ Forms submit properly

## Performance Optimization

The `.htaccess` file includes several optimizations:
- **Gzip Compression**: Reduces file sizes
- **Browser Caching**: Improves load times for returning visitors
- **Security Headers**: Protects against common attacks

## Support

If you encounter issues:
1. Check your cPanel error logs
2. Verify all files were uploaded correctly
3. Ensure your hosting plan supports `.htaccess` files
4. Contact your hosting provider if Apache modules are missing
