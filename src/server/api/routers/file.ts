import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabase } from "@/server/utils/supabase";
import { decode } from "base64-arraybuffer";
import isDataURI from "validator/lib/isDataURI";
import { TRPCError } from "@trpc/server";

export const fileRouter = createTRPCRouter({
  uploadFile: protectedProcedure
    .input(
      z.object({
        bucket: z.enum(["public"]),
        folder: z.enum(["user_avatars"]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        imageAsBase64: z.string().refine((str) => isDataURI(str)),
        mimeType: z.enum([
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/jpg",
          "image/webp",
        ]),
      })
    )
    .mutation(
      async ({
        ctx: { session },
        input: { bucket, imageAsBase64, mimeType, folder },
      }) => {
        const imageBase64Str = imageAsBase64.replace(/^.+,/, "");

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(
            `${folder}/${session.user.id}-${
              new Date().getTime() + Math.random()
            }.${mimeType.split("/")[1] as string}`,
            decode(imageBase64Str),
            {
              contentType: mimeType,
            }
          );

        if (error) {
          console.log(error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data?.path);

        return publicUrl;
      }
    ),
});
