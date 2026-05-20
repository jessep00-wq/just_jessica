import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, blogPosts, InsertBlogPost, authorBio, InsertAuthorBio } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { BlogPost, AuthorBio } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getAllPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).orderBy(blogPosts.createdAt).execute();
}

export async function getPostsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).where(eq(blogPosts.categoryId, categoryId)).orderBy(blogPosts.createdAt).execute();
}

export async function getFeaturedPost() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.featured, 1)).limit(1).execute();
  return result.length > 0 ? result[0] : null;
}

export async function createPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values(post).execute();
  return result;
}

export async function updatePost(id: number, post: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(blogPosts).set(post).where(eq(blogPosts.id, id)).execute();
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(blogPosts).where(eq(blogPosts.id, id)).execute();
}

export async function getAuthorBio(): Promise<AuthorBio | null | undefined> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(authorBio).limit(1).execute();
  return result.length > 0 ? result[0] : null;
}

export async function upsertAuthorBio(bio: InsertAuthorBio): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAuthorBio();
  if (existing) {
    await db.update(authorBio).set(bio).where(eq(authorBio.id, existing.id)).execute();
  } else {
    await db.insert(authorBio).values(bio).execute();
  }
}

export async function getFeaturedPosts(limit: number = 3) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).where(eq(blogPosts.featured, 1)).orderBy(blogPosts.createdAt).limit(limit).execute();
}
