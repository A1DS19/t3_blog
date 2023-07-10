import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { createPostSchema } from "@/schemas/createPostSchema";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { z } from "zod";

const findUniquePostBySlug = async (slug: string, prisma: PrismaClient) => {
  return await prisma.post.findUnique({ where: { slug } });
};

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const slug = slugify(input.title, {
        lower: true,
        trim: true,
      });

      if (await findUniquePostBySlug(slug, prisma)) {
        throw new Error("Post with this title already exists");
      }

      const post = await prisma.post.create({
        data: {
          title: input.title,
          description: input.description,
          text: input.text,
          slug,
          authorId: session.user.id,
        },
      });

      return post;
    }),
  getPosts: publicProcedure.query(async ({ ctx: { prisma, session } }) => {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
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
      },
    });
  }),
  getPost: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      const post = await prisma.post.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          likes: session?.user?.id
            ? {
                where: {
                  authorId: session.user.id,
                },
                select: {
                  id: true,
                },
              }
            : undefined,
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      return post;
    }),
  likePost: protectedProcedure.input(z.object({ postId: z.string() })).mutation(
    async ({
      ctx: {
        prisma,
        session: {
          user: { id: userId },
        },
      },
      input: { postId },
    }) => {
      await prisma.like.create({
        data: {
          postId,
          authorId: userId,
        },
      });
    }
  ),
  unlikePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      await prisma.like.delete({
        where: {
          authorId_postId: {
            postId: input.postId,
            authorId: session.user.id,
          },
        },
      });
    }),

  bookmark: protectedProcedure.input(z.object({ postId: z.string() })).mutation(
    async ({
      ctx: {
        prisma,
        session: {
          user: { id: userId },
        },
      },
      input: { postId },
    }) => {
      await prisma.bookmark.create({
        data: {
          postId,
          authorId: userId,
        },
      });
    }
  ),
  unBookmark: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      await prisma.bookmark.delete({
        where: {
          authorId_postId: {
            postId: input.postId,
            authorId: session.user.id,
          },
        },
      });
    }),
  comment: protectedProcedure
    .input(z.object({ postId: z.string(), text: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      await prisma.comment.create({
        data: {
          postId: input.postId,
          authorId: session.user.id,
          text: input.text,
        },
      });
    }),
  getComments: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      return await prisma.comment.findMany({
        where: {
          postId: input.postId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          text: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });
    }),
  getBookmarks: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      return await prisma.bookmark.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          authorId: session.user.id,
        },
        select: {
          id: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              featuredImage: true,
              createdAt: true,
            },
          },
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });
    }
  ),
});
