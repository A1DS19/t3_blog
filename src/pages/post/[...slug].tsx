import { PostSidebar } from "@/components/PostSidebar/PostSidebar";
import MainLayout from "@/components/layout/MainLayout";
import { ModalContext } from "@/context/ModalContext";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { BsChat } from "react-icons/bs";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";

export default function PostPage() {
  const { setIsOpen } = useContext(ModalContext);
  const router = useRouter();
  const { slug } = router.query;
  const [isLiked, setIsLiked] = React.useState(false);
  const { status } = useSession();

  let slugString;
  if (Array.isArray(slug) && slug.length > 0) {
    slugString = slug[0];
  } else if (typeof slug === "string") {
    slugString = slug;
  } else {
    console.warn("slug is undefined or not in the expected format");
  }

  const handleFetchPost = api.post.getPost.useQuery(
    {
      slug: slugString as string,
    },
    {
      enabled: !!slugString,
    }
  );

  React.useEffect(() => {
    if (handleFetchPost.isSuccess) {
      setIsLiked(handleFetchPost.data?.likes?.length > 0 ? true : false);
    }
  }, [handleFetchPost.isSuccess, handleFetchPost.data?.likes?.length]);

  const likePost = api.post.likePost.useMutation({
    onSuccess: () => {
      setIsLiked(true);
    },
  });

  const unlikePost = api.post.unlikePost.useMutation({
    onSuccess: () => {
      setIsLiked(false);
    },
  });

  return (
    <MainLayout>
      <PostSidebar postId={handleFetchPost.data?.id as string} />
      {handleFetchPost.isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : null}

      {handleFetchPost.isSuccess ? (
        <div className="fixed bottom-10 flex w-full items-center justify-center">
          <div className="group flex items-center space-x-4 rounded-full border border-gray-400 bg-white px-8 py-4 shadow-2xl transition duration-300 hover:border-gray-900">
            <div className="border-r pr-4 transition duration-300 group-hover:border-gray-900">
              {!isLiked ? (
                <FcLikePlaceholder
                  onClick={() =>
                    status === "authenticated"
                      ? likePost.mutate({ postId: handleFetchPost.data?.id })
                      : null
                  }
                  className="cursor-pointer text-2xl"
                />
              ) : (
                <FcLike
                  onClick={() =>
                    status === "authenticated"
                      ? unlikePost.mutate({ postId: handleFetchPost.data?.id })
                      : null
                  }
                  className="cursor-pointer text-2xl"
                />
              )}
            </div>
            <div>
              <BsChat
                className="cursor-pointer text-xl"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex h-full w-full flex-col items-center justify-center p-1">
        <div className="w-full max-w-screen-md flex-col space-y-6">
          <div className="relative h-[60vh] w-full rounded-xl bg-gray-300 shadow-lg">
            {/* {handleFetchPost.data?.featuredImage} */}
            <div className="absolute flex h-full w-full items-center justify-center ">
              <div className="rounded-xl bg-gray-500 bg-opacity-50 p-4 text-white">
                {handleFetchPost.data?.title}
              </div>
            </div>
          </div>
          <div className="border-l-4 border-gray-800 pl-4">
            {handleFetchPost.data?.description}
          </div>
          <div>{handleFetchPost.data?.text}</div>
        </div>
      </div>
    </MainLayout>
  );
}
