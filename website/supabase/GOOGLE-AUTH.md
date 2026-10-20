# Enable Google sign-in

The login and signup pages use Supabase OAuth with PKCE and `/auth/callback`. The callback exchanges the authorization code for a cookie session, then `/auth/redirect` checks database admin membership to route to `/admin` or `/account`. Google accounts do not automatically gain admin rights.

Google is currently disabled in this Supabase project. The owner must configure a Google OAuth client before live sign-in can be tested:

1. In Google Cloud Console, select/create your project and configure Google Auth Platform branding, audience, and the email/profile/OpenID scopes. For an External app in Testing, add the Google accounts that will test login.
2. Create an OAuth client of type Web application. Set the authorized redirect URI to `https://qiqamiznqaatmfvlpdhe.supabase.co/auth/v1/callback`.
3. In Supabase → Authentication → Sign In / Providers → Google, enable Google and enter the client ID and client secret. Save. Keep the client secret in Supabase, never in frontend code or public environment variables.
4. In Supabase → Authentication → URL Configuration, allow `http://localhost:3000/auth/callback` and the deployed website's exact `/auth/callback` URL. Set Site URL to the deployed website origin when deploying.
5. Visit `/signin` or `/signup` and choose Continue with Google. Confirm that a customer reaches `/account`, an existing approved admin reaches `/admin`, cancellation reaches the recoverable error page, and logout clears the session.

Google provides email/profile information, not the optional contact phone number entered in the email signup form. No extra Google scopes are requested to collect phone numbers.

Reference: https://supabase.com/docs/guides/auth/social-login/auth-google
