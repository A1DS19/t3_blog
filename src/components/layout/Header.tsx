import React from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { BsBell } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { signIn, signOut, useSession } from "next-auth/react";
import { ModalContext } from "@/context/ModalContext";
import Link from "next/link";

export const Header = () => {
  const { data: sessionData, status } = useSession();
  const { setModalProps, setIsOpen } = React.useContext(ModalContext);

  const handleWritePost = (): void => {
    setIsOpen(true);
    setModalProps({
      title: "Write a post",
      description: "Write a post and share it with the world",
    });
  };

  return (
    <>
      <header className="border-bo-[1px] flex h-20 w-full flex-row items-center justify-around border border-b-[1px] border-gray-200 bg-white">
        <div>
          <IoReorderThreeOutline className="h-10 w-10 text-2xl text-gray-600" />
        </div>
        <Link href="/">
          <div className="cursor-pointer select-none text-xl font-thin">
            T3 Blog App
          </div>
        </Link>
        {status === "authenticated" ? (
          <div className="flex items-center space-x-4">
            <div>
              <BsBell className="text-2xl text-gray-600" />
            </div>
            <div>
              <div className="h-5 w-5 rounded-full bg-gray-600" />
            </div>
            <div>
              <button
                onClick={() => handleWritePost()}
                className="flex items-center space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
              >
                <div>Write</div>
                <div>
                  <FiEdit />
                </div>
              </button>
            </div>
            <div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
              >
                <div>Logout</div>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="flex items-center space-x-2 rounded border border-gray-200 px-4 py-2.5  hover:border-gray-900 hover:text-gray-900"
          >
            <div>Signin</div>
          </button>
        )}
      </header>
    </>
  );
};
