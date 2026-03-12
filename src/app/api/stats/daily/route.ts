import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const stats = store.getDailyStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily stats" },
      { status: 500 }
    );
  }
}
