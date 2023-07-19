import { PostSidebar } from "@/components/PostSidebar/PostSidebar";
import { Loader } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import MainLayout from "@/components/layout/MainLayout";
import { ModalContext } from "@/context/ModalContext";
import { useDebounce } from "@/hooks/useDebounce";
import { addImageToPostSchema } from "@/schemas/addImageToPostSchema";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BiImageAdd } from "react-icons/bi";
import { BsChat } from "react-icons/bs";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { Markup } from "interweave";

export default function PostPage() {
  const { setIsOpen, isOpen } = useContext(ModalContext);
  const router = useRouter();
  const { slug } = router.query;
  const [isLiked, setIsLiked] = React.useState(false);
  const { status, data } = useSession();
  const { register, watch, reset } = useForm<{ query: string }>({
    resolver: zodResolver(addImageToPostSchema),
  });
  const controlledQuery = watch("query");
  const debouncedQuery = useDebounce(controlledQuery, 500);
  const [selectedImage, setSelectedImage] = React.useState<string>("");
  const postRouter = api.useContext().post;

  let slugString = "";
  if (Array.isArray(slug) && slug.length > 0) {
    slugString = slug[0] as string;
  } else if (typeof slug === "string") {
    slugString = slug;
  } else {
    console.warn("slug is undefined or not in the expected format");
  }

  const handleFetchPost = api.post.getPost.useQuery(
    {
      slug: slugString,
    },
    {
      enabled: !!slugString,
    }
  );

  const unsplashImages = api.unsplash.getImages.useQuery(
    {
      query: debouncedQuery,
    },
    {
      enabled: !!debouncedQuery,
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
  const isOwner = data?.user?.id === handleFetchPost.data?.authorId;
  const handleUpdateImage = api.post.updateFeaturedImage.useMutation({
    onSuccess: async () => {
      toast.success("Image added to post");
      await postRouter.getPost.invalidate({ slug: slugString });
      reset();
      setIsOpen(null);
    },
  });

  return (
    <MainLayout>
      {isOpen === "addBackgroundImageToPost" ? (
        <Modal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          modalProps={{ description: "", title: "Add image to post" }}
        >
          <div className="flex w-full max-w-md flex-col items-center justify-center space-y-4">
            <input
              {...register("query")}
              type="text"
              name="query"
              id="query"
              className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            />

            {unsplashImages.isLoading ? <Loader /> : null}

            {unsplashImages.isSuccess ? (
              <>
                <div className="lace-items-center relative grid h-96 w-full grid-cols-3 flex-wrap items-center justify-center gap-4 overflow-y-scroll">
                  <>
                    {unsplashImages.data?.results.map((image) => (
                      <div
                        key={image.id}
                        className={`relative aspect-video h-full w-full ${
                          selectedImage === image.urls.full
                            ? "border-4 border-teal-600"
                            : ""
                        }`}
                        onClick={() => setSelectedImage(image.urls.full)}
                      >
                        <Image
                          src={image.urls.thumb}
                          alt={image.alt_description ?? ""}
                          fill
                        />
                      </div>
                    ))}
                  </>
                </div>
                {selectedImage !== "" ? (
                  <div className="px-4">
                    <button
                      disabled={handleUpdateImage.isLoading}
                      type="button"
                      className="w-full space-x-2 rounded border border-gray-200 px-4 py-2.5  text-sm hover:border-gray-900 hover:text-gray-900"
                      onClick={() =>
                        handleUpdateImage.mutate({
                          postId: handleFetchPost.data?.id as string,
                          featuredImage: selectedImage,
                        })
                      }
                    >
                      Add image
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </Modal>
      ) : null}
      {handleFetchPost.isSuccess ? (
        <PostSidebar postId={handleFetchPost.data?.id} />
      ) : null}
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
                onClick={() => setIsOpen("messagesSideBarPost")}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex h-full w-full flex-col items-center justify-center p-1">
        <div className="w-full max-w-screen-md flex-col space-y-6">
          <div className="relative h-[60vh] w-full rounded-xl bg-gray-300 shadow-lg">
            {status === "authenticated" && isOwner ? (
              <div className="absolute left-2 top-2 z-10 cursor-pointer rounded-lg bg-black/30 p-4 text-white transition duration-300 hover:bg-black">
                <BiImageAdd
                  onClick={() => setIsOpen("addBackgroundImageToPost")}
                  className="text-2xl"
                />
              </div>
            ) : null}

            <div className="absolute flex h-full w-full items-center justify-center ">
              <div className="rounded-xl bg-gray-500 bg-opacity-50 p-4 text-white">
                {handleFetchPost.isSuccess &&
                handleFetchPost.data?.featuredImage ? (
                  <Image
                    src={handleFetchPost.data?.featuredImage}
                    alt={handleFetchPost.data?.title}
                    fill
                    className="rounded-xl"
                  />
                ) : (
                  <div>{handleFetchPost.data?.title}</div>
                )}
              </div>
            </div>
          </div>
          <div className="border-l-4 border-gray-800 pl-4">
            {handleFetchPost.data?.description}
          </div>
          <div>{handleFetchPost.data?.text}</div>
          <div className="prose lg:prose-xl">
            <Markup content={handleFetchPost.data?.html} />;
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
