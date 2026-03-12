import { NextResponse } from "next/server";

// Seed endpoint — migrated from Firebase to Supabase.
// Run the SQL migration directly in the Supabase SQL Editor instead.
export async function POST() {
  return NextResponse.json({
    message: "To seed the database, run the SQL migration in supabase/migrations/001_initial_schema.sql.",
    steps: [
      "1. Go to https://supabase.com/dashboard",
      "2. Open your project → SQL Editor",
      "3. Paste and run supabase/migrations/001_initial_schema.sql",
    ],
  });
}
