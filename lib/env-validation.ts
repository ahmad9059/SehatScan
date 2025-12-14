/**
 * Environment variable validation utility
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // NextAuth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;

  // Gemini AI
  GEMINI_API_KEY: string;

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
    NEXTAUTH_URL: "NextAuth.js application URL",
    NEXTAUTH_SECRET: "NextAuth.js secret key for JWT encryption",
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

        case "NEXTAUTH_URL":
          try {
            new URL(value);
          } catch {
            errors.push(
              `NEXTAUTH_URL must be a valid URL (e.g., http://localhost:3000)`
            );
          }
          break;

        case "NEXTAUTH_SECRET":
          if (value.length < 32) {
            warnings.push(
              `NEXTAUTH_SECRET should be at least 32 characters long for security`
            );
          }
          if (
            value ===
            "your-secret-key-here-generate-with-openssl-rand-base64-32"
          ) {
            errors.push(
              `NEXTAUTH_SECRET must be changed from the default example value`
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
      "See .env.example for reference.",
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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
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
    console.log(`   - NextAuth URL: ${config.NEXTAUTH_URL}`);
    console.log(
      `   - Gemini API: ${config.GEMINI_API_KEY ? "✅ Set" : "❌ Missing"}`
    );
    console.log(
      `   - NextAuth Secret: ${
        config.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing"
      }`
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
