// =============================================================================
// Cr1mnsx PS5 — Supabase Configuration
// To connect your real cloud database, insert your project URL and anon public key below.
// See SUPABASE_SETUP.md for quick setup instructions.
// =============================================================================

export const SUPABASE_CONFIG = {
  // Example: "https://your-project-id.supabase.co"
  url: "",

  // Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  anonKey: "",

  // Secret Owner/Admin PIN for approving, rejecting or managing incoming friend requests
  // Can be changed anytime by the owner:
  adminPin: "1994",

  // Storage bucket name for uploaded profile avatars
  storageBucket: "avatars"
};
