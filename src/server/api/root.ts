import { createTRPCRouter } from "@/server/api/trpc";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { fileRouter } from "./routers/file";
import { tagRouter } from "./routers/tag";
import { unsplashRouter } from "./routers/unsplash";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  file: fileRouter,
  tag: tagRouter,
  unsplash: unsplashRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
