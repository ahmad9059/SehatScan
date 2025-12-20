import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { analyzeFace, analyzeReport } from "./scan";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the session and analysis modules
vi.mock("@/lib/session", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/analysis", () => ({
  saveAnalysis: vi.fn(),
}));

import { requireAuth } from "@/lib/clerk-session";
import { saveAnalysis } from "@/lib/analysis";

describe("Server Actions Property-Based Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful authentication by default
    (requireAuth as any).mockResolvedValue({ id: "test-user-id" });

    // Mock successful database save by default
    (saveAnalysis as any).mockResolvedValue({
      success: true,
      analysis: { id: "test-analysis-id" },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Feature: sehatscan-ai, Property 13: Server action error handling
   * For any network error during server action execution, the response should contain a success: false field and an error message
   * Validates: Requirements 7.4
   */
  it("Property 13: Server action error handling", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          errorType: fc.constantFrom(
            "network_error",
            "http_error_400",
            "http_error_500",
            "json_parse_error",
            "timeout_error"
          ),
          statusCode: fc.integer({ min: 400, max: 599 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (testData) => {
          // Create a FormData object for testing
          const formData = new FormData();
          formData.append("file", new Blob(["test"], { type: "image/jpeg" }));

          // Mock different types of errors
          switch (testData.errorType) {
            case "network_error":
              mockFetch.mockRejectedValueOnce(new Error(testData.errorMessage));
              break;
            case "http_error_400":
            case "http_error_500":
              mockFetch.mockResolvedValueOnce({
                ok: false,
                status: testData.statusCode,
                json: vi
                  .fn()
                  .mockResolvedValue({ error: testData.errorMessage }),
              });
              break;
            case "json_parse_error":
              mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
              });
              break;
            case "timeout_error":
              mockFetch.mockRejectedValueOnce(new Error("Request timeout"));
              break;
          }

          // Test both analyzeFace and analyzeReport functions
          const faceResult = await analyzeFace(formData);
          const reportResult = await analyzeReport(formData);

          // Verify both results have the correct error structure
          expect(faceResult.success).toBe(false);
          expect(faceResult.error).toBeDefined();
          expect(typeof faceResult.error).toBe("string");
          if (faceResult.error) {
            expect(faceResult.error.length).toBeGreaterThan(0);
          }

          expect(reportResult.success).toBe(false);
          expect(reportResult.error).toBeDefined();
          expect(typeof reportResult.error).toBe("string");
          if (reportResult.error) {
            expect(reportResult.error.length).toBeGreaterThan(0);
          }

          // Verify that data field is not present in error responses
          expect(faceResult).not.toHaveProperty("data");
          expect(reportResult).not.toHaveProperty("data");

          // Verify that analysisId is not present in error responses
          expect(faceResult).not.toHaveProperty("analysisId");
          expect(reportResult).not.toHaveProperty("analysisId");
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test for successful responses to ensure the property works both ways
  it("should return success structure for successful responses", async () => {
    const mockSuccessData = {
      test: "data",
      visual_metrics: [],
      structured_data: {},
    };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockSuccessData),
    });

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/jpeg" }));

    const faceResult = await analyzeFace(formData);
    const reportResult = await analyzeReport(formData);

    expect(faceResult.success).toBe(true);
    expect(faceResult.data).toEqual(mockSuccessData);
    expect(faceResult.analysisId).toBe("test-analysis-id");
    expect(faceResult).not.toHaveProperty("error");

    expect(reportResult.success).toBe(true);
    expect(reportResult.data).toEqual(mockSuccessData);
    expect(reportResult.analysisId).toBe("test-analysis-id");
    expect(reportResult).not.toHaveProperty("error");
  });

  // Test authentication failure
  it("should handle authentication errors", async () => {
    (requireAuth as any).mockRejectedValue(new Error("Unauthorized"));

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/jpeg" }));

    const faceResult = await analyzeFace(formData);
    const reportResult = await analyzeReport(formData);

    expect(faceResult.success).toBe(false);
    expect(faceResult.error).toBe(
      "Authentication required. Please log in again."
    );

    expect(reportResult.success).toBe(false);
    expect(reportResult.error).toBe(
      "Authentication required. Please log in again."
    );
  });

  // Test database save failure (should still return analysis data)
  it("should handle database save failures gracefully", async () => {
    const mockSuccessData = {
      test: "data",
      visual_metrics: [],
      structured_data: {},
    };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockSuccessData),
    });

    (saveAnalysis as any).mockResolvedValue({
      success: false,
      error: "Database connection failed",
    });

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/jpeg" }));

    const faceResult = await analyzeFace(formData);
    const reportResult = await analyzeReport(formData);

    // Should still return success with data, but include save error
    expect(faceResult.success).toBe(true);
    expect(faceResult.data).toEqual(mockSuccessData);
    expect(faceResult.saveError).toBe("Database connection failed");
    expect(faceResult).not.toHaveProperty("analysisId");

    expect(reportResult.success).toBe(true);
    expect(reportResult.data).toEqual(mockSuccessData);
    expect(reportResult.saveError).toBe("Database connection failed");
    expect(reportResult).not.toHaveProperty("analysisId");
  });
});
