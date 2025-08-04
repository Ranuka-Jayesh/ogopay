# Deployment Guide for OgoPay

## Environment Variables Setup

When hosting your application, you need to set up environment variables to ensure tracking URLs work correctly.

### Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Your hosted domain URL (required for tracking URLs to work)
VITE_PUBLIC_URL=https://your-domain.com

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Example for Different Hosting Platforms

#### Vercel
```env
VITE_PUBLIC_URL=https://your-app.vercel.app
```

#### Netlify
```env
VITE_PUBLIC_URL=https://your-app.netlify.app
```

#### GitHub Pages
```env
VITE_PUBLIC_URL=https://your-username.github.io/your-repo-name
```

#### Custom Domain
```env
VITE_PUBLIC_URL=https://yourdomain.com
```

## Netlify-Specific Setup

### 1. Create Redirects File
Create a file called `_redirects` in the `public` folder:

```
# Netlify redirects for SPA routing
# This ensures all routes work properly with client-side routing

# Handle tracking URLs
/track/* /index.html 200

# Handle all other routes
/* /index.html 200
```

### 2. Create netlify.toml (Optional)
Create a `netlify.toml` file in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/track/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Environment Variables in Netlify
1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variables:
   - `VITE_PUBLIC_URL` = `https://your-app.netlify.app`
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

## Build and Deploy

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy the `dist` folder** to your hosting platform

## Important Notes

- **Tracking URLs**: The `VITE_PUBLIC_URL` environment variable is crucial for tracking URLs to work correctly in hosted environments
- **HTTPS**: Make sure your hosted domain uses HTTPS for security
- **CORS**: Ensure your Supabase project allows requests from your hosted domain
- **SPA Routing**: The `_redirects` file is essential for Netlify to handle client-side routing

## Testing Tracking URLs

After deployment, test a tracking URL by:
1. Adding a friend in the admin dashboard
2. Copying their tracking URL
3. Opening the URL in an incognito/private browser window
4. Verifying the tracking page loads correctly

## Troubleshooting

### 404 Errors on Netlify
- **Check `_redirects` file**: Ensure it's in the `public` folder and contains the redirect rules
- **Verify build output**: Make sure the `_redirects` file is copied to the `dist` folder
- **Check environment variables**: Ensure `VITE_PUBLIC_URL` is set correctly in Netlify dashboard

### Tracking URLs Not Working
- Check that `VITE_PUBLIC_URL` is set correctly
- Ensure the URL doesn't end with a trailing slash
- Verify the domain is accessible and uses HTTPS
- Check browser console for any JavaScript errors

### Build Errors
- Make sure all environment variables are set
- Check that Supabase credentials are correct
- Verify all dependencies are installed

### Runtime Errors
- Check browser console for errors
- Verify Supabase connection
- Ensure all routes are properly configured

## Debug Tracking URLs

If tracking URLs still don't work, you can debug them by:

1. Opening browser console
2. Running: `debugTrackingUrl('your-tracking-url')`
3. Check the console output for debugging information 