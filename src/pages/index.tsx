import { Sidebar } from "@/components/layout/Sidebar";
import { Search } from "@/components/layout/search/Search";
import MainLayout from "@/components/layout/MainLayout";
import { Index as WriteFormModal } from "@/components/forms/WriteModalForm/Index";
import React from "react";
import { Post } from "@/components/Post/Index";
import { api } from "@/utils/api";

export default function Index() {
  const getPosts = api.post.getPosts.useQuery();

  return (
    <MainLayout>
      <section className="grid grid-cols-12">
        <main className="col-span-8 h-full w-full border-r border-gray-300 px-5">
          <Search />
          <div className="flex w-full flex-col justify-center space-y-6">
            {getPosts.isLoading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
              </div>
            ) : null}
            {getPosts.isSuccess
              ? getPosts.data.map((post) => <Post key={post?.id} post={post} />)
              : null}
          </div>
        </main>
        <Sidebar />
      </section>
      <WriteFormModal />
    </MainLayout>
  );
}
