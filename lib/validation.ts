// ---------------------------------------------------------------------------
// Zod validation schemas for API input. Keep these the single source of truth
// for request shapes so every route validates consistently.
// ---------------------------------------------------------------------------

import { z } from "zod";

export const PHRASE_CATEGORIES = [
  "Leave Request",
  "Meeting",
  "Status Update",
  "Approval Request",
  "Delay Notification",
  "Client Communication",
  "HR Communication",
  "Custom",
] as const;

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

// --- Profile ----------------------------------------------------------------
export const updateProfileSchema = z.object({
  full_name: z.string().trim().max(120).optional(),
  avatar_url: z.string().trim().url().max(2048).or(z.literal("")).optional(),
  preferred_language: z.enum(["en", "ko"]).optional(),
  default_translation_mode: z.string().trim().max(40).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  notification_preferences: z
    .object({
      product_updates: z.boolean(),
      usage_alerts: z.boolean(),
    })
    .partial()
    .optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// --- Phrases ----------------------------------------------------------------
export const createPhraseSchema = z.object({
  title: nonEmpty(160),
  category: z.string().trim().max(60).default("Custom"),
  phrase_content: nonEmpty(4000),
  language: z.enum(["ko", "en"]).default("ko"),
  is_favorite: z.boolean().optional(),
});
export type CreatePhraseInput = z.infer<typeof createPhraseSchema>;

export const updatePhraseSchema = z.object({
  id: z.string().uuid(),
  title: nonEmpty(160).optional(),
  category: z.string().trim().max(60).optional(),
  phrase_content: nonEmpty(4000).optional(),
  language: z.enum(["ko", "en"]).optional(),
  is_favorite: z.boolean().optional(),
});
export type UpdatePhraseInput = z.infer<typeof updatePhraseSchema>;

export const idSchema = z.object({ id: z.string().uuid() });

// --- History ----------------------------------------------------------------
export const historyDeleteSchema = z.object({
  id: z.string().uuid().optional(),
  ids: z.array(z.string().uuid()).optional(),
}).refine((v) => v.id || (v.ids && v.ids.length > 0), {
  message: "Provide an id or ids to delete.",
});

export const historyFavoriteSchema = z.object({
  id: z.string().uuid(),
  is_favorite: z.boolean(),
});

// --- Favorites --------------------------------------------------------------
export const favoriteSchema = z.object({
  resource_type: z.enum(["translation", "phrase", "analysis"]),
  resource_id: z.string().uuid(),
});

// --- Templates --------------------------------------------------------------
export const generateTemplateSchema = z.object({
  template_id: z.string().uuid().optional(),
  template_title: z.string().trim().max(160).optional(),
  category: z.string().trim().max(60).optional(),
  name: z.string().trim().max(120).optional(),
  department: z.string().trim().max(120).optional(),
  project: z.string().trim().max(160).optional(),
  situation: nonEmpty(2000),
  save_to_history: z.boolean().optional(),
});
export type GenerateTemplateInput = z.infer<typeof generateTemplateSchema>;

export type ParseResult<T> =
  | { ok: true; data: T; error?: undefined }
  | { ok: false; error: string; data?: undefined };

/** Parse a request body, returning a typed result or a flat error message. */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<ParseResult<T>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { ok: false, error: "Invalid JSON body." };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path?.join(".");
    return {
      ok: false,
      error: path
        ? `${path}: ${first.message}`
        : first?.message ?? "Invalid input.",
    };
  }
  return { ok: true, data: result.data };
}
