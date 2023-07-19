import "react-quill/dist/quill.snow.css";
import { Modal } from "@/components/common/Modal";
import { ModalContext } from "@/context/ModalContext";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema } from "@/schemas/createPostSchema";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { z } from "zod";
import { Combobox } from "@/components/common/Combobox";
import dynamic from "next/dynamic";

//import ReactQuill from "react-quill";
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

export type SelectedId = { id: string };
export type SelectedIds = SelectedId[];

export const Index: React.FC = () => {
  const { isOpen, modalProps, setIsOpen } = React.useContext(ModalContext);
  const [selectedTagIds, setSelectedTagIds] = React.useState<SelectedIds>([]);
  type IFormInput = z.infer<typeof createPostSchema>;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<IFormInput>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange",
  });

  const postRoute = api.useContext().post;
  const tags = api.tag.getTags.useQuery();
  const handleCreatePost = api.post.createPost.useMutation({
    onSuccess: async () => {
      toast.success("Post created successfully");
      setIsOpen(null);
      reset();
      await postRoute.getPosts.invalidate();
    },
  });

  const onSubmit = (data: IFormInput) => {
    selectedTagIds.length > 0
      ? handleCreatePost.mutate({ ...data, tagIds: selectedTagIds })
      : handleCreatePost.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen === "createPost"}
      setIsOpen={() => setIsOpen("createPost")}
      title={modalProps.title}
      description={modalProps.description}
    >
      <div className="max-w-md">
        <div className="mb-5 mt-1 flex w-full items-center">
          <>
            {tags.isLoading ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-15 w-15 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
              </div>
            ) : null}
            {tags.isSuccess ? (
              <>
                <div className="2-4/5 z-10">
                  <Combobox
                    data={tags.data}
                    selectedTagIds={selectedTagIds}
                    setSelectedTagIds={setSelectedTagIds}
                  />
                </div>

                <div className="px-4">
                  <button
                    type="button"
                    className="space-x-2 rounded border border-gray-200 px-4 py-2.5 text-sm  hover:border-gray-900 hover:text-gray-900"
                    onClick={() => setIsOpen("createTag")}
                  >
                    Create Tag
                  </button>
                </div>
              </>
            ) : null}
          </>
        </div>
        {!tags.isLoading && tags.isSuccess && selectedTagIds.length > 0 ? (
          <div className="mb-3">
            <div>
              <p className="mb-2 mt-1 w-full text-left text-sm font-semibold text-gray-700">
                Selected tags:
              </p>
            </div>
            <div className="flex w-full flex-wrap">
              {selectedTagIds.map((tag) => (
                <div
                  key={tag.id}
                  className="m-1 flex items-center justify-center rounded-full bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700"
                >
                  {tags.data.find((t) => t.id === tag.id)?.name}
                </div>
              ))}
            </div>
          </div>
        ) : null}
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
            <Controller
              control={control}
              name="html"
              render={({ field: { onChange, onBlur, value } }) => (
                <ReactQuill
                  theme="snow"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {/* <textarea
              id="text"
              cols={30}
              rows={10}
              className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
              placeholder="Main body of the post"
              {...register("text")}
            /> */}
            <p className="mb-2 mt-1 w-full text-left text-sm text-red-500">
              {errors.html?.message}
            </p>
          </div>

          <div className="flex w-full justify-between">
            <div>
              <button
                type="button"
                className="space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
                onClick={() => setIsOpen(null)}
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
      </div>
    </Modal>
  );
};
