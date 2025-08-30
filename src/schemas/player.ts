import { z } from "zod";

// Skill level enum - Beach volleyball format
// A = Anfänger (beginner), F = Fortgeschritten (advanced)
export const SkillLevelEnum = z.enum(["A1", "A2", "A3", "F1", "F2", "F3"]);
export type SkillLevel = z.infer<typeof SkillLevelEnum>;

// Base player schema
export const PlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  skillLevel: SkillLevelEnum.default("A1"),
  profilePicture: z.string().url().optional().nullable(),
  supabaseId: z.string().min(1, "Supabase ID is required"),
  email: z.string().email("Invalid email format"),
});

// Schema for creating a player (without ID - will be generated)
export const CreatePlayerSchema = PlayerSchema.omit({ id: true });

// Schema for updating a player (all fields optional except required ones)
export const UpdatePlayerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  skillLevel: SkillLevelEnum.optional(),
  profilePicture: z.string().url().optional().nullable(),
  supabaseId: z.string().min(1, "Supabase ID is required").optional(),
  email: z.string().email("Invalid email format").optional(),
});

// Schema for Supabase player creation/update
export const SupabasePlayerSchema = z.object({
  supabaseId: z.string().min(1, "Supabase ID is required"),
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  skillLevel: SkillLevelEnum.default("A1"),
  profilePicture: z.string().url().optional(),
});

// Type exports
export type Player = z.infer<typeof PlayerSchema>;
export type CreatePlayer = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayer = z.infer<typeof UpdatePlayerSchema>;
export type SupabasePlayer = z.infer<typeof SupabasePlayerSchema>;
