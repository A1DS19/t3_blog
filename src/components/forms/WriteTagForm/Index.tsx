import { Modal } from "@/components/common/Modal";
import { ModalContext } from "@/context/ModalContext";
import { createTagSchema } from "@/schemas/createTagSchema";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export const Index: React.FC = () => {
  const { isOpen, modalProps, setIsOpen } = React.useContext(ModalContext);
  type IFormInput = z.infer<typeof createTagSchema>;
  const tagRoute = api.useContext().tag;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<IFormInput>({
    resolver: zodResolver(createTagSchema),
    mode: "onChange",
  });

  const createTag = api.tag.createTag.useMutation({
    onSuccess: async () => {
      toast.success("Tag created successfully");
      setIsOpen("createPost");
      reset();
      await tagRoute.getTags.invalidate();
    },
  });

  const onSubmit = (data: IFormInput) => {
    createTag.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen === "createTag"}
      setIsOpen={() => setIsOpen("createTag")}
      title={modalProps.title}
      description={modalProps.description}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex flex-col items-center justify-center space-y-4"
      >
        <div className="h-full w-full">
          {createTag.error ? (
            <p className=" mb-5 mt-3 w-full text-left text-lg text-red-500">
              {createTag.error?.message}
            </p>
          ) : null}
          {createTag.isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <div className="h-15 w-15 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
          ) : null}
          <input
            type="text"
            id="name"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            placeholder="Name of the tag"
            {...register("name")}
          />
          <p className="mb-2 mt-1 w-full text-left text-sm text-red-500">
            {errors.name?.message}
          </p>
        </div>

        <div className="h-full w-full">
          <textarea
            id="description"
            cols={30}
            rows={10}
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            placeholder="Main body of the post"
            {...register("description")}
          />
          <p className="mb-2 mt-1 w-full text-left text-sm text-red-500">
            {errors.description?.message}
          </p>
        </div>

        <div className="flex w-full justify-between">
          <div>
            <button
              type="button"
              className="space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
              onClick={() => setIsOpen("createPost")}
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
              Create Tag
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
