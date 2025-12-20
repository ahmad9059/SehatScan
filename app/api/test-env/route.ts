import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      DIRECT_URL: process.env.DIRECT_URL ? "✅ Set" : "❌ Missing",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
    });
  } catch (error) {
    console.error("Environment test error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Environment check failed",
      },
      { status: 500 }
    );
  }
}
