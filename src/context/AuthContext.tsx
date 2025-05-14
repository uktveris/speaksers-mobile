import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { getSocket } from "@/src/server/socket";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { routerReplace, ROUTES } from "../utils/navigation";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useSession() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useSession must be used within a SessionProvider");
  return context;
}

function SessionProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setIsLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    routerReplace(ROUTES.homeScreen);
  };

  const signOut = async () => {
    const socket = getSocket();
    if (socket.connected) socket.disconnect();
    await supabase.auth.signOut();
    routerReplace(ROUTES.login);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useSession, SessionProvider };
