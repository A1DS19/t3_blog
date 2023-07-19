import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createApi } from "unsplash-js";
import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";
import { addImageToPostSchema } from "@/schemas/addImageToPostSchema";

const unsplash = createApi({
  accessKey: env.UNSPLASH_API_ACCESS_KEY,
});

export const unsplashRouter = createTRPCRouter({
  getImages: protectedProcedure
    .input(addImageToPostSchema)
    .query(async ({ ctx: {}, input }) => {
      try {
        const data = await unsplash.search.getPhotos({
          query: input.query,
          page: 1,
          orderBy: "relevant",
          orientation: "landscape",
          perPage: 10,
        });

        return data.response;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong with Unsplash API",
        });
      }
    }),
});
