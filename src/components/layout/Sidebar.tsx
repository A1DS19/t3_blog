import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Loader } from "../common/Loader";
import Image from "next/image";
import toast from "react-hot-toast";

export const Sidebar: React.FC = ({}) => {
  const { status } = useSession();
  const handleGetBookmarks = api.post.getBookmarks.useQuery();
  const router = useRouter();
  const { data } = useSession();
  const userRouter = api.useContext().user;

  const suggestions = api.user.getSuggestions.useQuery();
  const handleGoToPost = async (slug: string): Promise<void> => {
    await router.push(`/post/${slug}`);
  };

  const followUser = api.user.followUser.useMutation({
    onSuccess: async () => {
      await userRouter.getSuggestions.invalidate();
      await userRouter.getUser.invalidate();
      toast.success("Followed");
    },
  });
  const unfollowUser = api.user.unfollowUser.useMutation({
    onSuccess: async () => {
      await userRouter.getSuggestions.invalidate();
      await userRouter.getUser.invalidate();
      toast.success("Un Followed");
    },
  });

  if (status !== "authenticated") return null;

  return (
    <aside className="top-20 col-span-4 flex h-full w-full flex-col p-6">
      <div>
        <h3 className="my-6 text-lg font-semibold">
          People you might be interested
        </h3>
      </div>
      <div>
        <div className="flex flex-col space-y-4">
          {suggestions.isLoading ? <Loader /> : null}

          {suggestions.isSuccess &&
            suggestions.data?.length > 0 &&
            suggestions.data.map((suggestion) => {
              const isFollowedByUser = suggestion.followedBy
                .flatMap((user) => user.id)
                .includes(data?.user.id as string);

              return (
                <div
                  key={suggestion.name}
                  className="flex flex-row items-center space-x-5"
                >
                  <div className="h-10 w-10 flex-none rounded-full bg-gray-500">
                    {suggestion.image ? (
                      <Image
                        src={suggestion.image}
                        alt={suggestion.username || suggestion.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {suggestion.name}
                    </div>
                    <div className="text-xs">{suggestion.username}</div>
                  </div>
                  <div>
                    <button
                      onClick={
                        isFollowedByUser
                          ? () =>
                              unfollowUser.mutate({
                                userId: suggestion.id,
                              })
                          : () =>
                              followUser.mutate({
                                userId: suggestion.id,
                              })
                      }
                      className="flex items-center space-x-2 rounded border border-gray-400/50 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
                    >
                      {isFollowedByUser ? "Un Follow" : "Follow"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {handleGetBookmarks.data && handleGetBookmarks.isLoading ? (
        <Loader />
      ) : null}

      {status === "authenticated" && handleGetBookmarks.data ? (
        <div className="sticky top-20">
          <h3 className="my-6 text-lg font-semibold">Reading list</h3>
          <div className="flex flex-col space-y-8">
            {handleGetBookmarks.data.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group flex items-center space-x-2"
              >
                <div
                  onClick={async () => await handleGoToPost(bookmark.post.slug)}
                  className="aspect-square h-full w-2/5 cursor-pointer rounded-xl bg-gray-300"
                >
                  {bookmark.post.featuredImage ? (
                    <Image
                      src={bookmark.post.featuredImage}
                      alt={bookmark.post.title}
                      width={150}
                      height={200}
                      className="rounded-xl object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex w-3/5 flex-col space-y-2">
                  <div
                    onClick={async () =>
                      await handleGoToPost(bookmark.post.slug)
                    }
                    className="cursor-pointer text-lg font-semibold decoration-black group-hover:underline"
                  >
                    {bookmark.post.title}
                  </div>
                  <div className="truncate">{bookmark.post.description}</div>
                  <div className="flex w-full items-center space-x-1">
                    <div className="h-8 w-8 rounded-full bg-gray-300">
                      {bookmark.author.image && bookmark.author.name ? (
                        <Image
                          src={bookmark.author.image}
                          alt={bookmark.author.name}
                          width={32}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>{bookmark.author.name} &#8226;</div>
                    <div>{dayjs(bookmark.createdAt).format("DD MMM YYYY")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
};
