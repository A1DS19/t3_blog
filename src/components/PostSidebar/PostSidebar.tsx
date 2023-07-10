import { ModalContext } from "@/context/ModalContext";
import { Dialog, Transition } from "@headlessui/react";
import React, { useContext } from "react";
import { HiXMark } from "react-icons/hi2";
import { createCommentSchema } from "@/schemas/createCommentSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { Loader } from "../common/Loader";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface PostSidebarProps {
  postId: string;
}

export const PostSidebar: React.FC<PostSidebarProps> = ({ postId }) => {
  const { isOpen, setIsOpen } = useContext(ModalContext);
  type CommentForm = z.infer<typeof createCommentSchema>;
  const { status } = useSession();
  const postRoute = api.useContext().post;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CommentForm>({
    resolver: zodResolver(createCommentSchema),
  });

  const handleComment = api.post.comment.useMutation({
    onSuccess: async () => {
      await postRoute.getComments.invalidate({ postId });
      toast.success("Comment added");
    },
  });
  const handleGetComments = api.post.getComments.useQuery({
    postId,
  });

  const onSubmit = (data: CommentForm) => {
    handleComment.mutate({
      postId,
      text: data.text,
    });
    reset();
  };

  return (
    <>
      <Transition.Root show={isOpen} as={React.Fragment}>
        <Dialog onClose={() => setIsOpen(false)} as="div">
          <div className="fixed right-0 top-0">
            <Transition.Child
              enter="transition duration-1000"
              leave="transition duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative h-screen w-[200px] bg-white sm:w-[400px]">
                <div className="flex h-full w-full flex-col p-5">
                  <div className="mb-6 mt-10 flex items-center justify-between px-6 text-xl">
                    <h2 className="font-medium">
                      Responses ({handleGetComments.data?.length})
                    </h2>
                    <div>
                      <HiXMark
                        className="cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      />
                    </div>
                  </div>
                  {status === "authenticated" ? (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="mb-10 flex w-full flex-col items-end space-y-4"
                    >
                      <textarea
                        id="text"
                        rows={3}
                        className={`$ w-full rounded-xl border border-gray-300 p-4 shadow-lg outline-none focus:border-gray-300 focus:shadow-2xl`}
                        placeholder="What are your thoughts?"
                        {...register("text")}
                      />
                      {errors.text && (
                        <p className="text-sm text-red-500">
                          {errors.text.message}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={!isValid}
                        className={`rounded border border-gray-200 px-4 py-2 hover:border-gray-900 hover:text-gray-900 ${
                          !isValid ? "cursor-not-allowed" : ""
                        }`}
                      >
                        Comment
                      </button>
                    </form>
                  ) : null}
                  {handleGetComments.isLoading ? (
                    <Loader size={[20, 20]} />
                  ) : null}
                  {handleGetComments.data?.length === 0 ? (
                    <p>No comments yet</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 overflow-x-scroll">
                      {handleGetComments.data?.map((comment) => (
                        <div
                          key={comment?.id}
                          className="flex w-full flex-col space-y-2 border-b border-gray-900 pb-4 first:mt-5 last:border-none"
                        >
                          <div className="flex w-full items-center space-x-2">
                            <div className="relative h-10 w-10 rounded-full bg-gray-600"></div>
                            <div>
                              <p className="font-semibold">
                                {comment?.author?.name}
                              </p>
                              <p className="text-sm">
                                {dayjs(comment?.createdAt).fromNow()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {comment?.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
