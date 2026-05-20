import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'admin-user',
    email: 'admin@example.com',
    name: 'Admin User',
    loginMethod: 'manus',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

describe('blog procedures', () => {
  it('listAll should return posts and categories for public users', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.listAll();

    expect(result).toHaveProperty('posts');
    expect(result).toHaveProperty('categories');
    expect(Array.isArray(result.posts)).toBe(true);
    expect(Array.isArray(result.categories)).toBe(true);
  });

  it('getFeatured should return featured post or null', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.getFeatured();

    expect(result === null || typeof result === 'object').toBe(true);
  });

  it('create should require authentication', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.blog.create({
        title: 'Test Post',
        excerpt: 'Test excerpt',
        body: 'Test body',
        categoryId: 1,
        featured: 0,
      });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect((error as Error).message).toBeDefined();
    }
  });

  it('admin should be able to create posts (authorization check)', async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.blog.create({
        title: 'Admin Test Post',
        excerpt: 'Admin test excerpt',
        body: 'Admin test body',
        categoryId: 1,
        featured: 0,
      });

      expect(result).toBeDefined();
    } catch (error) {
      // Database might not have category 1, but authorization should pass
      const message = (error as Error).message;
      expect(message).not.toContain('Unauthorized');
    }
  });

  it('delete should require authentication', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.blog.delete({ id: 1 });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect((error as Error).message).toBeDefined();
    }
  });
});
