import { describe, it, expect } from "vitest";
import { hash, compare } from "bcryptjs";

describe("Auth Helper Functions", () => {
  describe("Password hashing", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hashed = await hash(password, 12);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should produce different hashes for the same password", async () => {
      const password = "testpassword123";
      const hash1 = await hash(password, 12);
      const hash2 = await hash(password, 12);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Password verification", () => {
    it("should verify a correct password", async () => {
      const password = "testpassword123";
      const hashed = await hash(password, 12);
      const isValid = await compare(password, hashed);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hashed = await hash(password, 12);
      const isValid = await compare(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });

    it("should handle empty passwords", async () => {
      const password = "";
      const hashed = await hash(password, 12);
      const isValid = await compare(password, hashed);

      expect(isValid).toBe(true);
    });
  });
});
