import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { getSocket } from "@/src/server/socket";
import type { Session } from "@supabase/supabase-js";
import Constants from "expo-constants";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { routerReplace, ROUTES } from "../utils/navigation";
import { getBackendUrl } from "../config/urlConfig";
import axiosConfig from "../config/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  userData: {};
  getAvatar: () => string;
  deleteAcount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useSession() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useSession must be used within a SessionProvider");
  return context;
}

async function deleteUserAvatar(path: string) {
  console.log("received avatar path to delete:", path);
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from("avatars").remove([path]);
  if (error) {
    console.log("error deleting user avatar:", error.message);
    return false;
  }
  console.log("successfully deleted user avatar");
  return true;
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

  const deleteAcount = async () => {
    const url = getBackendUrl();
    const userId = session?.user.id;
    if (!userId) {
      console.log("no user id found, returning..");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("users")
        .select("avatar_url")
        .eq("id", userId)
        .single();
      if (error) {
        console.log("erorr retrieving avatar url:", error.message);
        return;
      }
      const success = await deleteUserAvatar(data.avatar_url);
      if (!success) {
        return;
      }
      const response = await axiosConfig.delete(url + "/api/users/delete", {
        data: { userId: userId },
        headers: { "Content-Type": "application/json" },
      });
      console.log("deleting user:", response.data);
      await AsyncStorage.clear();
      signOut();
    } catch (err) {
      console.log("error while deleting user:", (err as Error).message);
    }
  };

  // TODO: must change and edit to NOT use session; just return user

  return (
    <AuthContext.Provider
      value={{ session, isLoading, signIn, signOut, deleteAcount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useSession, SessionProvider };
