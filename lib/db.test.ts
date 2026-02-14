import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { Prisma, PrismaClient } from "@prisma/client";

// Create a test Prisma client
const prisma = new PrismaClient();

describe("Database Property-Based Tests", () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.analysis.deleteMany({});
    await prisma.user.deleteMany({});
  });

  /**
   * Feature: sehatscan-ai, Property 14: Database persistence round-trip
   * For any user registration, creating a user record and then querying by email should return the same user data
   * Validates: Requirements 8.1
   */
  it("Property 14: Database persistence round-trip", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
            nil: null,
          }),
        }),
        async (userData) => {
          // Create user
          const createdUser = await prisma.user.create({
            data: {
              ...userData,
              password: "test-password",
            },
          });

          // Query by email
          const queriedUser = await prisma.user.findUnique({
            where: { email: userData.email },
          });

          // Verify the data matches
          expect(queriedUser).not.toBeNull();
          expect(queriedUser?.email).toBe(userData.email);
          expect(queriedUser?.name).toBe(userData.name);
          expect(queriedUser?.id).toBe(createdUser.id);

          // Clean up
          await prisma.user.delete({ where: { id: createdUser.id } });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sehatscan-ai, Property 15: Analysis foreign key integrity
   * For any saved analysis record, the userId field should reference an existing user in the database
   * Validates: Requirements 8.2
   */
  it("Property 15: Analysis foreign key integrity", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userEmail: fc.emailAddress(),
          userName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
            nil: null,
          }),
          analysisType: fc.constantFrom("face", "report"),
          rawData: fc.jsonValue(),
          structuredData: fc.option(fc.jsonValue(), { nil: null }),
          visualMetrics: fc.option(fc.jsonValue(), { nil: null }),
          riskAssessment: fc.option(
            fc.string({ minLength: 1, maxLength: 500 }),
            { nil: null }
          ),
        }),
        async (testData) => {
          // Create user first
          const user = await prisma.user.create({
            data: {
              email: testData.userEmail,
              name: testData.userName,
              password: "test-password",
            },
          });

          // Create analysis with valid userId
          const analysis = await prisma.analysis.create({
            data: {
              userId: user.id,
              type: testData.analysisType,
              rawData: (testData.rawData ?? {}) as Prisma.InputJsonValue,
              structuredData:
                testData.structuredData === null
                  ? undefined
                  : (testData.structuredData as Prisma.InputJsonValue),
              visualMetrics:
                testData.visualMetrics === null
                  ? undefined
                  : (testData.visualMetrics as Prisma.InputJsonValue),
              riskAssessment: testData.riskAssessment,
            },
          });

          // Verify the analysis references the correct user
          const queriedAnalysis = await prisma.analysis.findUnique({
            where: { id: analysis.id },
            include: { user: true },
          });

          expect(queriedAnalysis).not.toBeNull();
          expect(queriedAnalysis?.userId).toBe(user.id);
          expect(queriedAnalysis?.user.email).toBe(testData.userEmail);

          // Clean up
          await prisma.analysis.delete({ where: { id: analysis.id } });
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sehatscan-ai, Property 16: User analysis retrieval
   * For any user with saved analyses, querying the database should return only analyses belonging to that user
   * Validates: Requirements 8.3
   */
  it("Property 16: User analysis retrieval", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user1Email: fc.emailAddress(),
          user2Email: fc
            .emailAddress()
            .filter((email) => email !== fc.sample(fc.emailAddress(), 1)[0]),
          analysisCount: fc.integer({ min: 1, max: 5 }),
        }),
        async (testData) => {
          // Create two users
          const user1 = await prisma.user.create({
            data: { email: testData.user1Email, password: "test-password" },
          });
          const user2 = await prisma.user.create({
            data: { email: testData.user2Email, password: "test-password" },
          });

          // Create analyses for user1
          const user1Analyses = [];
          for (let i = 0; i < testData.analysisCount; i++) {
            const analysis = await prisma.analysis.create({
              data: {
                userId: user1.id,
                type: i % 2 === 0 ? "face" : "report",
                rawData: { test: `data${i}` },
              },
            });
            user1Analyses.push(analysis);
          }

          // Create some analyses for user2
          await prisma.analysis.create({
            data: {
              userId: user2.id,
              type: "face",
              rawData: { test: "user2data" },
            },
          });

          // Query analyses for user1
          const queriedAnalyses = await prisma.analysis.findMany({
            where: { userId: user1.id },
          });

          // Verify only user1's analyses are returned
          expect(queriedAnalyses.length).toBe(testData.analysisCount);
          queriedAnalyses.forEach((analysis: { userId: string }) => {
            expect(analysis.userId).toBe(user1.id);
          });

          // Clean up
          await prisma.analysis.deleteMany({ where: { userId: user1.id } });
          await prisma.analysis.deleteMany({ where: { userId: user2.id } });
          await prisma.user.delete({ where: { id: user1.id } });
          await prisma.user.delete({ where: { id: user2.id } });
        }
      ),
      { numRuns: 100 }
    );
  });
});
