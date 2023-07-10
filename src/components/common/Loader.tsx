import React from "react";

type ILoaderProps = {
  size?: [number, number];
};

export const Loader: React.FC<ILoaderProps> = ({ size = [32, 32] }) => {
  return (
    <div className="flex h-96 items-center justify-center">
      <div
        className={`h-${size[0]} w-${size[1]} animate-spin rounded-full border-b-2 border-t-2 border-gray-900`}
      ></div>
    </div>
  );
};
