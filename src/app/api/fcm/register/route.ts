import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid FCM token" },
        { status: 400 }
      );
    }

    const isNew = store.registerFcmToken(token);
    return NextResponse.json({
      success: true,
      registered: isNew,
      message: isNew ? "Token registered" : "Token already registered",
    });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    return NextResponse.json(
      { error: "Failed to register token" },
      { status: 500 }
    );
  }
}
