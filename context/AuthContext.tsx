import { getSupabaseClient } from "@/hooks/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

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
  const router = useRouter();

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

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!session) {
  //       router.replace("/login");
  //     } else if (session) {
  //       router.replace("/(protected)/(tabs)");
  //     }
  //   }
  // }, [session, isLoading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useSession, SessionProvider };
