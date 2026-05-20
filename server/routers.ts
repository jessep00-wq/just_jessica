import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  blog: router({
    listAll: publicProcedure.query(async () => {
      const { getAllPosts, getAllCategories, getAuthorBio } = await import("./db");
      const posts = await getAllPosts();
      const categories = await getAllCategories();
      const authorBioData = await getAuthorBio();
      return { posts, categories, authorBio: authorBioData };
    }),
    listByCategory: publicProcedure.input((val: unknown) => {
      if (typeof val === "object" && val !== null && "categoryId" in val) {
        return { categoryId: (val as { categoryId: unknown }).categoryId };
      }
      throw new Error("Invalid input");
    }).query(async ({ input }) => {
      const { getPostsByCategory } = await import("./db");
      return getPostsByCategory(input.categoryId as number);
    }),
    getFeatured: publicProcedure.query(async () => {
      const { getFeaturedPost } = await import("./db");
      return getFeaturedPost();
    }),
    getFeaturedPosts: publicProcedure.query(async () => {
      const { getFeaturedPosts } = await import("./db");
      return getFeaturedPosts(3);
    }),
    getAuthorBio: publicProcedure.query(async () => {
      const { getAuthorBio } = await import("./db");
      return getAuthorBio();
    }),
    updateAuthorBio: protectedProcedure.input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const v = val as Record<string, unknown>;
        return {
          bio: v.bio as string | undefined,
          photoUrl: v.photoUrl as string | undefined,
        };
      }
      throw new Error("Invalid input");
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: admin access required");
      }
      const { upsertAuthorBio } = await import("./db");
      return upsertAuthorBio(input);
    }),
    create: protectedProcedure.input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const v = val as Record<string, unknown>;
        return {
          title: v.title as string,
          excerpt: v.excerpt as string,
          body: v.body as string,
          categoryId: v.categoryId as number,
          featured: v.featured as number,
          ogImage: v.ogImage as string | undefined,
        };
      }
      throw new Error("Invalid input");
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: admin access required");
      }
      const { createPost } = await import("./db");
      return createPost(input);
    }),
    update: protectedProcedure.input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const v = val as Record<string, unknown>;
        return {
          id: v.id as number,
          title: v.title as string | undefined,
          excerpt: v.excerpt as string | undefined,
          body: v.body as string | undefined,
          categoryId: v.categoryId as number | undefined,
          featured: v.featured as number | undefined,
          ogImage: v.ogImage as string | undefined,
        };
      }
      throw new Error("Invalid input");
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: admin access required");
      }
      const { updatePost } = await import("./db");
      const { id, ...updateData } = input;
      return updatePost(id, updateData);
    }),
    delete: protectedProcedure.input((val: unknown) => {
      if (typeof val === "object" && val !== null && "id" in val) {
        return { id: (val as { id: unknown }).id as number };
      }
      throw new Error("Invalid input");
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: admin access required");
      }
      const { deletePost } = await import("./db");
      return deletePost(input.id);
    }),
    subscribeNewsletter: publicProcedure.input((val: unknown) => {
      if (typeof val === "object" && val !== null && "email" in val) {
        const email = (val as { email: unknown }).email as string;
        if (!email || !email.includes('@')) {
          throw new Error("Invalid email address");
        }
        return { email };
      }
      throw new Error("Invalid input");
    }).mutation(async ({ input }) => {
      const { subscribeToNewsletter } = await import("./db");
      return subscribeToNewsletter(input.email);
    }),
    listSubscribers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: admin access required");
      }
      const { getAllSubscribers } = await import("./db");
      return getAllSubscribers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
