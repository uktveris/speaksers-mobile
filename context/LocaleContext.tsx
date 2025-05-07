import * as Localization from "expo-localization";
import { createContext, useContext, useEffect, useState } from "react";
import { AppStateStatus } from "react-native";
import { AppState } from "react-native";
import { PropsWithChildren } from "react";

interface LocaleContextType {
  locales: Localization.Locale[];
  initializeLocales: () => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

function LocaleProvider({ children }: PropsWithChildren) {
  const [locales, setLocales] = useState(Localization.getLocales());

  const initializeLocales = () => {
    const updated = Localization.getLocales();
    setLocales(updated);
    console.log("locale update:", updated);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          initializeLocales();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <LocaleContext.Provider value={{ locales, initializeLocales }}>
      {children}
    </LocaleContext.Provider>
  );
}

export { LocaleProvider, useLocale };
