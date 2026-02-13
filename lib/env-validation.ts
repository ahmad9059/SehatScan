/**
 * Environment variable validation utility
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Gemini AI
  GEMINI_API_KEY: string;

  // Optional UploadThing (cloud storage for uploaded originals)
  UPLOADTHING_TOKEN?: string;

  // Optional Supabase (if using Supabase auth)
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates all required environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = {
    DATABASE_URL: "Supabase PostgreSQL connection string",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      "Clerk publishable key for client-side authentication",
    CLERK_SECRET_KEY: "Clerk secret key for server-side authentication",
    GEMINI_API_KEY: "Google Gemini API key for AI analysis",
  };

  // Check required variables
  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];

    if (!value) {
      errors.push(
        `Missing required environment variable: ${varName} (${description})`
      );
    } else {
      // Additional validation for specific variables
      switch (varName) {
        case "DATABASE_URL":
          if (!value.startsWith("postgresql://")) {
            errors.push(
              `DATABASE_URL must be a valid PostgreSQL connection string starting with 'postgresql://'`
            );
          }
          break;

        case "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY":
          if (!value.startsWith("pk_")) {
            errors.push(
              `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with 'pk_'`
            );
          }
          if (value === "YOUR_PUBLISHABLE_KEY") {
            errors.push(
              `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be changed from the placeholder value`
            );
          }
          break;

        case "CLERK_SECRET_KEY":
          if (!value.startsWith("sk_")) {
            errors.push(`CLERK_SECRET_KEY must start with 'sk_'`);
          }
          if (value === "YOUR_SECRET_KEY") {
            errors.push(
              `CLERK_SECRET_KEY must be changed from the placeholder value`
            );
          }
          break;

        case "GEMINI_API_KEY":
          if (value.length < 20) {
            warnings.push(
              `GEMINI_API_KEY appears to be too short. Please ensure you have a valid API key from Google AI Studio.`
            );
          }
          if (value === "your-gemini-api-key-here") {
            errors.push(
              `GEMINI_API_KEY must be changed from the default example value`
            );
          }
          break;
      }
    }
  }

  // Check optional Supabase variables (warn if only one is set)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if ((supabaseUrl && !supabaseKey) || (!supabaseUrl && supabaseKey)) {
    warnings.push(
      "Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY should be set if using Supabase features"
    );
  }

  const uploadThingToken = process.env.UPLOADTHING_TOKEN;
  if (!uploadThingToken) {
    warnings.push(
      "UPLOADTHING_TOKEN is not set. Face scan originals will not be archived in UploadThing."
    );
  } else if (uploadThingToken.length < 16) {
    warnings.push(
      "UPLOADTHING_TOKEN appears too short. Please verify your token."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets validated environment configuration
 * Throws error if validation fails
 */
export function getEnvConfig(): EnvConfig {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    const errorMessage = [
      "❌ Environment validation failed:",
      ...validation.errors.map((error) => `  - ${error}`),
      "",
      "Please check your .env file and ensure all required variables are set.",
      "Get your Clerk keys from: https://dashboard.clerk.com",
    ].join("\n");

    throw new Error(errorMessage);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/**
 * Validates environment on startup (for server-side)
 * Call this in your main application entry point
 */
export function validateEnvironmentOnStartup(): void {
  try {
    const config = getEnvConfig();
    console.log("✅ Environment validation passed");
    console.log(
      `   - Database: ${
        config.DATABASE_URL.includes("supabase")
          ? "✅ Supabase"
          : "✅ PostgreSQL"
      }`
    );
    console.log(
      `   - Clerk Publishable Key: ${
        config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing"
      }`
    );
    console.log(
      `   - Gemini API: ${config.GEMINI_API_KEY ? "✅ Set" : "❌ Missing"}`
    );
    console.log(
      `   - UploadThing: ${config.UPLOADTHING_TOKEN ? "✅ Set" : "⚠️ Optional (not set)"}`
    );
    console.log(
      `   - Clerk Secret: ${config.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing"}`
    );

    if (config.NEXT_PUBLIC_SUPABASE_URL) {
      console.log(`   - Supabase: ✅ Configured`);
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Environment validation failed"
    );
    process.exit(1);
  }
}
