import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { supabase } from "@/server/utils/supabase";

export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      return await prisma.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          followedBy: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              posts: true,
              followedBy: true,
              following: true,
            },
          },
        },
      });
    }),
  getPosts: publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      return await prisma.post.findMany({
        where: { authorId: input.authorId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
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
  updateAvatar: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const oldImage = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          image: true,
        },
      });

      if (oldImage?.image) {
        const path = `${oldImage.image.split("public")[2] as string}`;
        await supabase.storage.from("public").remove([path]);
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { image: input.imageUrl },
      });

      return await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          image: true,
        },
      });
    }),
  getSuggestions: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const query = {
        where: {
          authorId: session.user.id,
        },
        select: {
          post: {
            select: {
              tags: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 10,
      };

      const likes = await prisma.like.findMany(query);
      const bookmarks = await prisma.bookmark.findMany(query);

      const interestedTags: string[] = [
        ...likes.flatMap((like) => like.post.tags.map((tag) => tag.name)),
        ...bookmarks.flatMap((bookmark) =>
          bookmark.post.tags.map((tag) => tag.name)
        ),
      ];

      const suggestions = await prisma.user.findMany({
        where: {
          OR: [
            {
              likes: {
                some: {
                  post: {
                    tags: {
                      some: {
                        name: {
                          in: interestedTags,
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              bookmarks: {
                some: {
                  post: {
                    tags: {
                      some: {
                        name: {
                          in: interestedTags,
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
          NOT: {
            id: session.user.id,
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
          followedBy: {
            select: {
              id: true,
            },
          },
        },
        take: 4,
      });

      return suggestions;
    }
  ),
  followUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          following: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
    }),
  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          following: {
            disconnect: {
              id: input.userId,
            },
          },
        },
      });
    }),
  getAllFollowers: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      return await prisma.user.findMany({
        where: {
          id: session.user.id,
        },
        select: {
          followedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }
  ),
  getAllFollowing: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      return await prisma.user.findMany({
        where: {
          id: session.user.id,
        },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }
  ),
});
