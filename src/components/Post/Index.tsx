import { RouterOutputs, api } from "@/utils/api";
import { CiBookmarkCheck, CiBookmarkPlus } from "react-icons/ci";
import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

interface IPost {
  post: RouterOutputs["post"]["getPosts"][number]; // single post
}

export const Post: React.FC<IPost> = ({ post }) => {
  const router = useRouter();
  const { status } = useSession();
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const postRouter = api.useContext().post;

  const handleGoToPost = async (slug: string): Promise<void> => {
    await router.push(`/post/${slug}`);
  };

  React.useEffect(() => {
    if (post?.bookmarks?.length > 0) {
      setIsBookmarked(true);
    }
  }, [post.bookmarks]);

  const bookmarkPost = api.post.bookmark.useMutation({
    onSuccess: async () => {
      setIsBookmarked(true);
      await postRouter.getBookmarks.invalidate();
    },
  });

  const unBookmarkPost = api.post.unBookmark.useMutation({
    onSuccess: async () => {
      setIsBookmarked(false);
      await postRouter.getBookmarks.invalidate();
    },
  });

  return (
    <div
      className="group flex flex-col space-y-4 border-b border-gray-300 pb-8 last:border-none"
      key={post.id}
    >
      <div className="flex w-full items-center space-x-2">
        <div className="relative h-10 w-10 rounded-full bg-gray-600">
          {post.author.image ? (
            <Image
              fill
              src={post.author.image}
              alt={post.author.name || "user"}
              className="rounded-full"
            />
          ) : null}
        </div>
        <div>
          <p className="font-semibold">
            <span
              onClick={() => router.push(`/user/${post.author.username}`)}
              className="cursor-pointer decoration-black hover:underline"
            >
              {post.author.name}
            </span>{" "}
            &#8226;{" "}
            <span className="mx-1">
              {dayjs(post.createdAt).format("DD/MM/YYYY")}
            </span>
          </p>
          <p className="text-sm">Senior engineer</p>
        </div>
      </div>
      <div className="grid w-full grid-cols-12 gap-4">
        <div className="col-span-8 flex flex-col space-y-4">
          <p
            onClick={async () => handleGoToPost(post.slug)}
            className="max-w-prose cursor-pointer text-2xl font-bold text-gray-800 decoration-black hover:underline"
          >
            {post.title}
          </p>
          <p className="break-words text-sm text-gray-500">
            {post.description}
          </p>
        </div>
        <div className="col-span-4">
          <div
            onClick={async () => handleGoToPost(post.slug)}
            className="h-full w-full transform cursor-pointer rounded-xl bg-gray-300 transition duration-300 hover:scale-105 hover:shadow-xl"
          ></div>
        </div>
      </div>
      <div>
        <div className="flex w-full items-center justify-between space-x-4">
          <div>My topics:</div>
          <div className="flex items-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-200/50 px-5 py-2">
                {i} tag
              </div>
            ))}
          </div>
          {status === "authenticated" ? (
            <div>
              {!isBookmarked ? (
                <CiBookmarkPlus
                  onClick={() =>
                    bookmarkPost.mutate({
                      postId: post.id,
                    })
                  }
                  className="cursor-pointer text-3xl"
                />
              ) : (
                <CiBookmarkCheck
                  onClick={() =>
                    unBookmarkPost.mutate({
                      postId: post.id,
                    })
                  }
                  className="cursor-pointer text-3xl text-indigo-600"
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
