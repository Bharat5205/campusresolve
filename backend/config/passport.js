/**
 * config/passport.js
 * -------------------
 * Configures Passport.js strategies.
 *
 * Currently configured:
 *  - Google OAuth 2.0 (passport-google-oauth20)
 *
 * JWT authentication is handled manually via middleware (not via Passport)
 * to maintain full control over token validation and error responses.
 *
 * The strategy callback is intentionally left as a stub — authentication
 * logic will be implemented in the auth service when the auth module is built.
 */

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export function configurePassport(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("=== OAUTH DEBUG ===");
        console.log("Passport callback entered.");
        console.log("Google profile received:", profile.emails?.[0]?.value);
        // Handled in auth.service.js -> handleGoogleAuth
        try {
          done(null, profile);
        } catch (err) {
          console.error("Error in Passport Google Strategy:", err);
          done(err, null);
        }
      }
    )
  );
}
