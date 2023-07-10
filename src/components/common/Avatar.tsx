import Image, { type ImageProps } from "next/image";
import React from "react";

type IAvatarProps = ImageProps;

export const Avatar: React.FC<IAvatarProps> = ({ alt, className, src }) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={`${className as string} rounded-full`}
      fill
    />
  );
};
