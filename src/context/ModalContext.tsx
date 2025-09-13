import { createContext, useContext, useState } from "react";
import { View } from "react-native";
import { BottomModal } from "../components/ui/BottomModal";

interface ModalContextType {
  showModal: (conttent: React.ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useGlobalModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useGlobalModal must be used within ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);

  const showModal = (c: React.ReactNode) => {
    setContent(c);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setContent(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <View className="absolute inset-0">
        <BottomModal visible={visible} onClose={hideModal}>
          {content}
        </BottomModal>
      </View>
    </ModalContext.Provider>
  );
}
