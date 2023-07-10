import { Header } from "@/components/layout/Header";
import React from "react";

const MainLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      {children}
    </div>
  );
};

export default MainLayout;
