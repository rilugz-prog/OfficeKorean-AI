import { and, desc, eq, type SQL } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { parseBody, favoriteSchema } from "@/lib/validation";
import type { ResourceType } from "@/lib/database.types";

export const runtime = "nodejs";

// GET /api/favorites — list the user's favorites (optionally by resource_type).
export async function GET(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const type = new URL(req.url).searchParams.get("resource_type") as
    | ResourceType
    | null;

  const conditions: SQL[] = [eq(favorites.user_id, ctx.userId)];
  if (type) conditions.push(eq(favorites.resource_type, type));

  try {
    const items = await db
      .select()
      .from(favorites)
      .where(and(...conditions))
      .orderBy(desc(favorites.created_at));
    return apiSuccess({ items });
  } catch (dbError) {
    console.error("[/api/favorites GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load favorites.");
  }
}

// POST /api/favorites — add a favorite (idempotent via unique constraint).
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, favoriteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  try {
    const [favorite] = await db
      .insert(favorites)
      .values({
        user_id: ctx.userId,
        resource_type: parsed.data.resource_type,
        resource_id: parsed.data.resource_id,
      })
      .onConflictDoUpdate({
        target: [
          favorites.user_id,
          favorites.resource_type,
          favorites.resource_id,
        ],
        set: { resource_id: parsed.data.resource_id },
      })
      .returning();
    return apiSuccess({ favorite });
  } catch (dbError) {
    console.error("[/api/favorites POST]", dbError);
    return apiError("SERVER_ERROR", "Could not add favorite.");
  }
}

// DELETE /api/favorites — remove a favorite.
export async function DELETE(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, favoriteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  try {
    const deleted = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.user_id, ctx.userId),
          eq(favorites.resource_type, parsed.data.resource_type),
          eq(favorites.resource_id, parsed.data.resource_id)
        )
      )
      .returning({ id: favorites.id });
    return apiSuccess({ deleted: deleted.length });
  } catch (dbError) {
    console.error("[/api/favorites DELETE]", dbError);
    return apiError("SERVER_ERROR", "Could not remove favorite.");
  }
}
