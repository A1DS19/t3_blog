import React, { createContext } from "react";

type ModalProps = { title: string; description: string };
type Modals =
  | "createPost"
  | "createTag"
  | "addBackgroundImageToPost"
  | "messagesSideBarPost"
  | "viewFollowers"
  | "viewFollowing"
  | null;

export type ModalContextType = {
  isOpen: Modals;
  setIsOpen: React.Dispatch<React.SetStateAction<Modals>>;
  modalProps: ModalProps;
  setModalProps: React.Dispatch<React.SetStateAction<ModalProps>>;
};

export const ModalContext = createContext<ModalContextType>({
  isOpen: null,
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
  const [isOpen, setIsOpen] = React.useState<Modals>(null);
  // const prevOpenModal = React.useRef<Modals>(null);

  // React.useEffect(() => {
  //   prevOpenModal.current = isOpen;
  // }, [setIsOpen]);

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
