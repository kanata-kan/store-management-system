/**
 * Unit Tests - AuthService
 *
 * Tests for Authentication business logic
 */

import AuthService from "@/lib/services/AuthService.js";
import jwt from "jsonwebtoken";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestManager,
  createTestCashier,
  hashPassword,
} from "../helpers/index.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe("AuthService", () => {
  describe("login", () => {
    it("should login with valid credentials", async () => {
      // Arrange
      const manager = await createTestManager();

      // Act
      const result = await AuthService.login("manager@test.com", "Manager123");

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("manager@test.com");
      expect(result.user.role).toBe("manager");
      expect(result.user.passwordHash).toBeUndefined(); // Should not return password
      expect(result.token).toBeDefined();

      // Verify token is valid JWT
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBeDefined();
      expect(decoded.role).toBe("manager");
    });

    it("should throw error with invalid email", async () => {
      // Arrange
      await createTestManager();

      // Act & Assert
      await expect(
        AuthService.login("wrong@test.com", "Manager123")
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });

    it("should throw error with invalid password", async () => {
      // Arrange
      await createTestManager();

      // Act & Assert
      await expect(
        AuthService.login("manager@test.com", "WrongPassword")
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });

    it("should work for cashier role", async () => {
      // Arrange
      const cashier = await createTestCashier();

      // Act
      const result = await AuthService.login("cashier@test.com", "Cashier123");

      // Assert
      expect(result.user.role).toBe("cashier");
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      // Arrange
      const manager = await createTestManager();

      // Act
      const isValid = await AuthService.verifyPassword(manager, "Manager123");

      // Assert
      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      // Arrange
      const passwordHash = await hashPassword("TestPassword123");

      // Act
      const isValid = await AuthService.verifyPassword(
        "WrongPassword",
        passwordHash
      );

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe("getUserFromSession", () => {
    it("should return user from valid token", async () => {
      // Arrange
      const manager = await createTestManager();

      const token = jwt.sign(
        {
          userId: manager._id.toString(),
          role: manager.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Act
      const user = await AuthService.getUserFromSession(token);

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe("manager@test.com");
      expect(user.role).toBe("manager");
      expect(user.passwordHash).toBeUndefined();
    });

    it("should throw error with invalid token", async () => {
      // Arrange
      const invalidToken = "invalid.token.here";

      // Act & Assert
      await expect(
        AuthService.getUserFromSession(invalidToken)
      ).rejects.toThrow();
    });

    it("should throw error with expired token", async () => {
      // Arrange
      const manager = await createTestManager();

      const expiredToken = jwt.sign(
        {
          userId: manager._id.toString(),
          role: manager.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "0s" } // Expired immediately
      );

      // Wait a bit to ensure token is expired
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act & Assert
      await expect(
        AuthService.getUserFromSession(expiredToken)
      ).rejects.toThrow();
    });

    it("should throw error if user does not exist", async () => {
      // Arrange
      const fakeToken = jwt.sign(
        {
          id: "507f1f77bcf86cd799439011", // Non-existent user
          email: "fake@test.com",
          role: "manager",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Act & Assert
      await expect(
        AuthService.getUserFromSession(fakeToken)
      ).rejects.toThrow("Utilisateur introuvable");
    });
  });
});

