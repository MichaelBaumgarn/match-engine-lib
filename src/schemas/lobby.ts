import { z } from "zod";

export const createLobbySchema = z.object({
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

export const joinLobbySchema = z.object({
  playerId: z.string().uuid("Invalid playerId format"),
  side: z.enum(["left", "right"]),
});

export const leaveLobbySchema = z.object({
  playerId: z.string().uuid("Invalid playerId format"),
});

export const lobbyFiltersSchema = z.object({
  status: z.string().optional(),
  clubId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  startAfter: z.string().datetime().transform(val => new Date(val)).optional(),
  startBefore: z.string().datetime().transform(val => new Date(val)).optional(),
  availableOnly: z.enum(["true", "false"]).transform(val => val === "true").optional(),
});