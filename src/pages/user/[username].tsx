import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/utils/api";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { BiEdit } from "react-icons/bi";
import { SlShareAlt } from "react-icons/sl";
import toast from "react-hot-toast";
import { Post } from "@/components/Post/Index";
import { useSession } from "next-auth/react";

export default function UserProfilePage() {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const router = useRouter();
  const { username } = router.query;
  const currentUser = useSession();
  const userRoute = api.useContext().user;

  const handleGetUserProfile = api.user.getUser.useQuery(
    {
      username: username as string,
    },
    {
      enabled: !!username,
    }
  );

  React.useEffect(() => {
    if (handleGetUserProfile.data?.image) {
      setImageUrl(handleGetUserProfile.data?.image);
    }
  }, [handleGetUserProfile.data?.image]);

  const isUserOwner =
    currentUser.data?.user?.id === handleGetUserProfile.data?.id;

  const handleGetUserPosts = api.user.getPosts.useQuery(
    {
      authorId: handleGetUserProfile.data?.id,
    },
    {
      enabled: !!handleGetUserProfile.data?.id,
    }
  );

  const handleUploadFile = api.file.uploadFile.useMutation({
    onSuccess: (data) => {
      handleUpdateUserAvatar.mutate({
        imageUrl: data,
      });
    },
  });

  const handleUpdateUserAvatar = api.user.updateAvatar.useMutation({
    onSuccess: async (data) => {
      setImageUrl(data?.image as string);
      await userRoute.getUser.invalidate();
      await userRoute.getPosts.invalidate();
    },
  });

  const handleFileUpload = (file: File) => {
    if (file.size > 1.5 * 1000000) {
      throw new Error("File size is too big");
    }

    setImageUrl(URL.createObjectURL(file));
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      try {
        handleUploadFile.mutate({
          bucket: "public",
          folder: "user_avatars",
          imageAsBase64: fileReader.result as string,
          mimeType: "image/png",
        });

        toast.success("Profile picture updated");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    };
  };

  const followUser = api.user.followUser.useMutation({
    onSuccess: async () => {
      await userRoute.getSuggestions.invalidate();
      await userRoute.getUser.invalidate();
      toast.success("Followed");
    },
  });
  const unfollowUser = api.user.unfollowUser.useMutation({
    onSuccess: async () => {
      await userRoute.getSuggestions.invalidate();
      await userRoute.getUser.invalidate();
      toast.success("Un Followed");
    },
  });
  const isFollowedByUser = !!handleGetUserProfile.data?.followedBy.find(
    (user) => user.id === currentUser.data?.user?.id
  );

  return (
    <MainLayout>
      <div className="flex h-full w-full items-center justify-center">
        <div className="my-10 flex h-full w-full max-w-screen-sm flex-col items-center justify-center lg:max-w-screen-md xl:max-w-screen-lg">
          <div className="flex w-full flex-col rounded-3xl bg-white shadow-md">
            <div className="relative h-44 w-full rounded-t-3xl bg-gradient-to-r from-gray-900 to-gray-600 text-white">
              <div className="absolute -bottom-10 left-12">
                <div
                  className={`group relative h-28 w-28 ${
                    isUserOwner ? "cursor-pointer" : ""
                  } rounded-full border-2 border-white bg-gray-100`}
                >
                  {isUserOwner ? (
                    <label
                      htmlFor="avatarFile"
                      className="absolute z-10 flex h-full w-full cursor-pointer items-center justify-center rounded-full transition duration-500 group-hover:bg-black/20"
                    >
                      <BiEdit className="hidden text-3xl group-hover:block" />
                      <input
                        type="file"
                        name="avatarFile"
                        id="avatarFile"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files[0] as File);
                          }
                        }}
                      />
                    </label>
                  ) : null}
                  {handleGetUserProfile.data?.image ? (
                    <Image
                      src={handleGetUserProfile.data?.image ?? ""}
                      fill
                      className="rounded-full"
                      alt={handleGetUserProfile.data?.name ?? ""}
                    />
                  ) : null}

                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      fill
                      className="rounded-full"
                      alt={handleGetUserProfile.data?.name ?? ""}
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="ml-12 mt-8 flex flex-col rounded-b-3xl py-5">
              <div className="text-2xl font-semibold text-gray-800">
                {handleGetUserProfile.data?.name}
              </div>
              <div className="text-sm text-gray-600">
                @{handleGetUserProfile.data?.username}
              </div>
              <div className="text-sm text-gray-600">
                {handleGetUserProfile.data?._count.posts || 0} Posts
              </div>
              <div className="flex space-x-2 text-sm text-gray-600">
                <div>
                  {handleGetUserProfile.data?._count.following || 0} Following
                </div>
                <div>
                  {handleGetUserProfile.data?._count.followedBy || 0} Followers
                </div>
              </div>
              <div className="mt-1 flex space-x-2">
                <div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Copied to clipboard");
                    }}
                    className="mt-2 flex transform items-center space-x-2 rounded border border-gray-200 px-3  py-1.5 duration-500 hover:border-gray-900 hover:text-gray-900 active:scale-95"
                  >
                    <div>Share</div>
                    <div>
                      <SlShareAlt className="text-lg" />
                    </div>
                  </button>
                </div>
                {handleGetUserProfile.isSuccess &&
                currentUser.status === "authenticated" &&
                handleGetUserProfile.data &&
                handleGetUserProfile.data.id !== currentUser.data?.user.id ? (
                  <div>
                    <button
                      onClick={
                        isFollowedByUser
                          ? () =>
                              unfollowUser.mutate({
                                userId: handleGetUserProfile.data?.id as string,
                              })
                          : () =>
                              followUser.mutate({
                                userId: handleGetUserProfile.data?.id as string,
                              })
                      }
                      className="mt-2 flex transform items-center space-x-2 rounded border border-gray-200 px-3  py-1.5 duration-500 hover:border-gray-900 hover:text-gray-900 active:scale-95"
                    >
                      {isFollowedByUser ? "Un Follow" : "Follow"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="my-5 flex w-full flex-col justify-center space-y-6">
            {handleGetUserPosts.isLoading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
              </div>
            ) : null}
            {handleGetUserPosts.isSuccess && handleGetUserPosts.data
              ? handleGetUserPosts.data.map((post) => (
                  <Post
                    key={post?.id}
                    post={{
                      ...post,
                      author: {
                        ...post.author,
                        image: imageUrl,
                      },
                    }}
                  />
                ))
              : null}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
