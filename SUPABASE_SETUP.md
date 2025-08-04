# Supabase Setup Guide for Ogo Pay

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ogopay` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## Step 3: Set Up Environment Variables

1. Create a `.env` file in your project root:
   ```bash
   # Create .env file
   touch .env
   ```

2. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

   Replace `your-project-id` and `your_anon_key_here` with your actual values.

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content from `DB/db.sql`
3. Click "Run" to execute the SQL

## Step 5: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Enter:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Check this
4. Click "Create bucket"

## Step 6: Set Storage Policies

1. In the `profile-photos` bucket, go to **Policies**
2. Click "New Policy"
3. Choose "Create a policy from scratch"
4. Set up these policies:

### For INSERT (Upload):
- **Policy name**: `Allow authenticated uploads`
- **Target roles**: `authenticated`
- **Using expression**: `auth.role() = 'authenticated'`

### For SELECT (Download):
- **Policy name**: `Allow public downloads`
- **Target roles**: `public`
- **Using expression**: `true`

## Step 7: Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try to register a new user
3. Check the browser console for any errors

## Troubleshooting

### Error: "Failed to construct 'URL': Invalid URL"
- Make sure your `VITE_SUPABASE_URL` is correct
- URL should look like: `https://abcdefghijklmnop.supabase.co`

### Error: "Supabase not configured"
- Check that your `.env` file exists in the project root
- Verify your environment variables are correct
- Restart your development server after adding `.env`

### Error: "Invalid API key"
- Make sure you're using the **anon public key**, not the service role key
- The anon key starts with `eyJ`

### Database Connection Issues
- Check that your database schema was created successfully
- Verify the tables exist in Supabase dashboard under **Table Editor**

## Security Notes

- Never commit your `.env` file to version control
- The anon key is safe to use in client-side code
- For server-side operations, use the service role key (but keep it secret)

## Next Steps

After setup is complete, you can:
1. Test user registration and login
2. Upload profile photos
3. Add friends and transactions
4. Customize the application further

Need help? Check the Supabase documentation or create an issue in your project repository. 