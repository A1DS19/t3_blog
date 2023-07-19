import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import slugify from "slugify";
import { TRPCError } from "@trpc/server";

export const tagRouter = createTRPCRouter({
  createTag: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        description: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx: { prisma }, input: { name, description } }) => {
      const existingTag = await prisma.tag.findUnique({
        where: {
          name,
        },
      });

      if (existingTag) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tag already exists",
        });
      }

      const data = await prisma.tag.create({
        data: {
          name,
          description,
          slug: slugify(name, { lower: true }),
        },
      });

      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return data;
    }),
  getTags: protectedProcedure.query(async ({ ctx: { prisma } }) => {
    const data = await prisma.tag.findMany();

    if (!data) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return data;
  }),
  getTag: protectedProcedure
    .input(z.object({ slug: z.string().min(1).max(50) }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      const data = await prisma.tag.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              createdAt: true,
              author: {
                select: {
                  name: true,
                  image: true,
                  username: true,
                },
              },
              bookmarks: session?.user?.id
                ? {
                    where: {
                      authorId: session?.user?.id,
                    },
                    select: {
                      authorId: true,
                    },
                  }
                : undefined,
              tags: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return data;
    }),
});
