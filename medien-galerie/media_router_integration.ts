// Add this to your existing server/api/root.ts file

import { createTRPCRouter } from "~/server/api/trpc";
import { postRouter } from "~/server/api/routers/post";
import { mediaRouter } from "~/server/api/routers/media"; // Import the new media router

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  media: mediaRouter, // Add the media router here
});

// type definition of API
export type AppRouter = typeof appRouter;
