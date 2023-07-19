import { Post } from "@/components/Post/Index";
import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";

export default function TagPage() {
  const router = useRouter();
  const { slug } = router.query;

  const getTagWithPosts = api.tag.getTag.useQuery({ slug: slug as string });

  if (getTagWithPosts.isLoading) {
    return (
      <div className="flex h-20 items-center justify-center">
        <div className="h-15 w-15 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  if (getTagWithPosts.isError) {
    return <p className="text-red-500">{getTagWithPosts.error.message}</p>;
  }

  return (
    <MainLayout>
      <div className="my-10 flex h-full w-full max-w-screen-sm flex-col items-center justify-center lg:max-w-screen-md xl:max-w-screen-lg">
        <h1 className="text-xl font-semibold">
          Posts for tag:{" "}
          <span className="text-gray-600">{getTagWithPosts.data.name}</span>
        </h1>
      </div>

      <div className="flex justify-center">
        <div className="my-5 flex w-full max-w-md flex-col justify-center space-y-6">
          {getTagWithPosts.isSuccess && getTagWithPosts.data
            ? getTagWithPosts.data.posts.map((post) => (
                <Post
                  key={post?.id}
                  post={{
                    ...post,
                    author: {
                      ...post.author,
                    },
                  }}
                />
              ))
            : null}
        </div>
      </div>
    </MainLayout>
  );
}
