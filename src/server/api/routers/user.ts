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
          _count: {
            select: {
              posts: true,
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
});
