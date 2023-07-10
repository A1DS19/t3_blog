import type { IModalProps } from "@/types/Modal";
import React, { createContext } from "react";

type ModalProps = Pick<IModalProps, "title" | "description">;

export type ModalContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalProps: ModalProps;
  setModalProps: React.Dispatch<React.SetStateAction<ModalProps>>;
};

export const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  setIsOpen: () => null,
  modalProps: {
    title: "",
    description: "",
  },
  setModalProps: () => null,
});

export const ModalProvider = ({ children }: React.PropsWithChildren) => {
  const [modalProps, setModalProps] = React.useState<ModalProps>({
    title: "",
    description: "",
  });
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const values: ModalContextType = {
    isOpen,
    modalProps,
    setIsOpen,
    setModalProps,
  };

  return (
    <ModalContext.Provider value={values}>{children}</ModalContext.Provider>
  );
};
