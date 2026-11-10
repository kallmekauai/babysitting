# Thoughtful Childcare

## Supabase setup

1. Create a Supabase project and add an admin account in **Authentication → Users**.
2. Apply [`supabase/migrations/202611100001_availability_dashboard.sql`](./supabase/migrations/202611100001_availability_dashboard.sql) in the Supabase SQL Editor. The migration creates the private availability tables and a read-only calendar function for the public booking page.
3. Add the project URL and publishable anon key to `.env.local`:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
   ```

4. Start the site with `npm run dev`, sign in at `/admin`, and add weekly hours or date-specific changes. Admin writes are protected by Supabase authentication and row-level security. The parent calendar refreshes availability when opened, when returning to the tab, and every 30 seconds.

Booking request submission and approval also use the `submit-request` and `manage-booking` Supabase Edge Functions; configure and deploy those functions separately.