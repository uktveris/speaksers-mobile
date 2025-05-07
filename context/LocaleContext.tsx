import * as Localization from "expo-localization";
import { createContext, useContext, useEffect, useState } from "react";
import { AppStateStatus } from "react-native";
import { AppState } from "react-native";
import { PropsWithChildren } from "react";

interface LocaleContextType {
  locales: Localization.Locale[];
  calendars: Localization.Calendar[];
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
  const [calendars, setCalendars] = useState(Localization.getCalendars());

  const initializeLocales = () => {
    const updatedLocales = Localization.getLocales();
    const updatedCalendars = Localization.getCalendars();
    setLocales(updatedLocales);
    setCalendars(updatedCalendars);
    console.log("locale update:", updatedLocales);
    console.log("calendar update:", updatedCalendars);
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
    <LocaleContext.Provider value={{ locales, calendars, initializeLocales }}>
      {children}
    </LocaleContext.Provider>
  );
}

export { LocaleProvider, useLocale };
