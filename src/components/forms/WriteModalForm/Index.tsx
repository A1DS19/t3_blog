import { Modal } from "@/components/common/Modal";
import { ModalContext } from "@/context/ModalContext";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema } from "@/schemas/createPostSchema";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { z } from "zod";

export const Index: React.FC = () => {
  const { isOpen, modalProps, setIsOpen } = React.useContext(ModalContext);
  type IFormInput = z.infer<typeof createPostSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<IFormInput>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange",
  });

  const postRoute = api.useContext().post;
  const handleCreatePost = api.post.createPost.useMutation({
    onSuccess: async () => {
      toast.success("Post created successfully");
      setIsOpen(false);
      reset();
      await postRoute.getPosts.invalidate();
    },
  });

  const onSubmit = (data: IFormInput) => {
    handleCreatePost.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={modalProps.title}
      description={modalProps.description}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex flex-col items-center justify-center space-y-4"
      >
        <div className="h-full w-full">
          {handleCreatePost.error ? (
            <p className=" mb-5 mt-3 w-full text-left text-lg text-red-500">
              {handleCreatePost.error?.message}
            </p>
          ) : null}
          {handleCreatePost.isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <div className="h-15 w-15 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
          ) : null}
          <input
            type="text"
            id="title"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            placeholder="Title of the post"
            {...register("title")}
          />
          <p className="mb-2 mt-1 w-full text-left text-sm text-red-500">
            {errors.title?.message}
          </p>
        </div>

        <div className="h-full w-full">
          <input
            type="text"
            id="description"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            placeholder="Short description of the post"
            {...register("description")}
          />
          <p className="mb-2 mt-1 w-full text-left text-sm text-red-500">
            {errors.description?.message}
          </p>
        </div>

        <div className="h-full w-full">
          <textarea
            id="text"
            cols={30}
            rows={10}
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            placeholder="Main body of the post"
            {...register("text")}
          />
          <p className="mb-2 mt-1 w-full text-left text-sm text-red-500">
            {errors.text?.message}
          </p>
        </div>

        <div className="flex w-full justify-between">
          <div>
            <button
              type="button"
              className="space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isValid}
              className={`space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900 ${
                !isValid ? "cursor-not-allowed" : ""
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
