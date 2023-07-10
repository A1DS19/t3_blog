import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Loader } from "../common/Loader";

export const Sidebar: React.FC = ({}) => {
  const { status } = useSession();
  const handleGetBookmarks = api.post.getBookmarks.useQuery();
  const router = useRouter();

  const handleGoToPost = async (slug: string): Promise<void> => {
    await router.push(`/post/${slug}`);
  };

  return (
    <aside className="top-20 col-span-4 flex h-full w-full flex-col p-6">
      <div>
        <h3 className="my-6 text-lg font-semibold">
          People you might be interested
        </h3>
      </div>
      <div>
        <div className="flex flex-col space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-row items-center space-x-5">
              <div className="h-10 w-10 flex-none rounded-full bg-gray-500"></div>
              <div>
                <div className="text-sm font-bold text-gray-900">John Doe</div>
                <div className="text-xs">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </div>
              </div>
              <div>
                <button className="flex items-center space-x-2 rounded border border-gray-400/50 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900">
                  Follow
                </button>
              </div>
            </div>
          ))}
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
                ></div>
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
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
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
