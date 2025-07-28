import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { postRouter } from "~/server/api/routers/post";
import { authRouter } from "~/server/api/routers/auth";
import { mediaRouter } from "~/server/api/routers/media";
import { localMediaRouter } from "~/server/api/routers/local-media";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  media: mediaRouter,
  localMedia: localMediaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
