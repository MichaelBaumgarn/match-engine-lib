import { describe, it, expect } from "vitest";
import { z } from "zod";

// Zod schema for lobby creation (copied from routes/lobbies.ts)
const createLobbySchema = z.object({
  creatorId: z.string().uuid("Invalid creatorId format"),
  startAt: z
    .string()
    .datetime("Invalid startAt format")
    .transform((val) => new Date(val)),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  clubId: z.string().uuid("Invalid clubId format").optional(),
  courtName: z.string().min(1, "Court name is required").optional(),
  maxPlayersBySide: z.number().int().positive().min(2).max(10).optional(),
});

describe("Lobby Endpoint Validation", () => {
  describe("Valid data scenarios", () => {
    it("should validate complete valid data", () => {
      const validData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
        courtName: "Tennis Court 1",
        maxPlayersBySide: 4,
        clubId: "660e8400-e29b-41d4-a716-446655440000",
      };

      const result = createLobbySchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.creatorId).toBe(validData.creatorId);
        expect(result.data.startAt).toBeInstanceOf(Date);
        expect(result.data.durationMinutes).toBe(90);
        expect(result.data.courtName).toBe("Tennis Court 1");
        expect(result.data.maxPlayersBySide).toBe(4);
        expect(result.data.clubId).toBe(validData.clubId);
      }
    });

    it("should validate minimal required data", () => {
      const minimalData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 60,
      };

      const result = createLobbySchema.safeParse(minimalData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.creatorId).toBe(minimalData.creatorId);
        expect(result.data.startAt).toBeInstanceOf(Date);
        expect(result.data.durationMinutes).toBe(60);
        expect(result.data.courtName).toBeUndefined();
        expect(result.data.maxPlayersBySide).toBeUndefined();
        expect(result.data.clubId).toBeUndefined();
      }
    });

    it("should transform startAt string to Date", () => {
      const data = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
      };

      const result = createLobbySchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.startAt).toBeInstanceOf(Date);
        expect(result.data.startAt.getTime()).toBe(
          new Date("2024-01-01T10:00:00Z").getTime()
        );
      }
    });
  });

  describe("Invalid data scenarios", () => {
    it("should reject invalid creatorId format", () => {
      const invalidData = {
        creatorId: "invalid-uuid",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("creatorId")
        );
        expect(error).toBeDefined();
        expect(error?.message).toBe("Invalid creatorId format");
      }
    });

    it("should reject invalid startAt format", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "invalid-date",
        durationMinutes: 90,
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("startAt")
        );
        expect(error).toBeDefined();
        expect(error?.message).toBe("Invalid startAt format");
      }
    });

    it("should reject negative duration", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: -30,
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("durationMinutes")
        );
        expect(error).toBeDefined();
        expect(error?.message).toBe("Duration must be positive");
      }
    });

    it("should reject zero duration", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 0,
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("durationMinutes")
        );
        expect(error).toBeDefined();
        expect(error?.message).toBe("Duration must be positive");
      }
    });

    it("should reject invalid maxPlayersBySide range (too small)", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
        maxPlayersBySide: 1, // Too small
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("maxPlayersBySide")
        );
        expect(error).toBeDefined();
        expect(error?.code).toBe("too_small");
      }
    });

    it("should reject invalid maxPlayersBySide range (too large)", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
        maxPlayersBySide: 11, // Too large
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("maxPlayersBySide")
        );
        expect(error).toBeDefined();
        expect(error?.code).toBe("too_big");
      }
    });

    it("should reject invalid clubId format", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
        clubId: "invalid-club-uuid",
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("clubId")
        );
        expect(error).toBeDefined();
        expect(error?.message).toBe("Invalid clubId format");
      }
    });

    it("should reject empty courtName", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: "2024-01-01T10:00:00Z",
        durationMinutes: 90,
        courtName: "", // Empty string
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("courtName")
        );
        expect(error).toBeDefined();
        expect(error?.message).toBe("Court name is required");
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        creatorId: "550e8400-e29b-41d4-a716-446655440000",
        // Missing startAt
        durationMinutes: 90,
      };

      const result = createLobbySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error.issues.find((issue) =>
          issue.path.includes("startAt")
        );
        expect(error).toBeDefined();
        expect(error?.code).toBe("invalid_type");
      }
    });
  });

  describe("Edge cases", () => {
    it("should accept valid UUIDs in different formats", () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440000",
      ];

      validUUIDs.forEach((uuid) => {
        const data = {
          creatorId: uuid,
          startAt: "2024-01-01T10:00:00Z",
          durationMinutes: 90,
        };

        const result = createLobbySchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept various valid datetime formats", () => {
      const validDates = ["2024-01-01T10:00:00Z", "2024-01-01T10:00:00.000Z"];

      validDates.forEach((dateStr) => {
        const data = {
          creatorId: "550e8400-e29b-41d4-a716-446655440000",
          startAt: dateStr,
          durationMinutes: 90,
        };

        const result = createLobbySchema.safeParse(data);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.startAt).toBeInstanceOf(Date);
        }
      });
    });
  });
});
