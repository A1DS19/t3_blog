import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { createPostSchema } from "@/schemas/createPostSchema";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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
          html: input.html,
          slug,
          authorId: session.user.id, // same as connect
          tags: {
            connect: input.tagIds,
          },
        },
      });

      return post;
    }),
  getPosts: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { cursor } }) => {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          createdAt: true,
          featuredImage: true,
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
            take: 10 + 1,
            cursor: cursor
              ? {
                  id: cursor,
                }
              : undefined,
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > 10) {
        const nextItem = posts.pop();
        if (nextItem) {
          nextCursor = nextItem.id;
        }
      }

      return { posts, nextCursor };
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
              id: true,
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
  updateFeaturedImage: protectedProcedure
    .input(z.object({ postId: z.string(), featuredImage: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const post = await prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (post?.authorId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this post",
        });
      }

      await prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          featuredImage: input.featuredImage,
        },
      });

      return true;
    }),
});
