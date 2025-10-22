import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { getSocket } from "@/src/server/socket";
import type { AuthError, Session } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { getBackendUrl } from "../config/urlConfig";
import axiosConfig from "../config/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<AuthError | null>;
  // userData: {};
  // getAvatar: () => string;
  deleteAccount: () => Promise<String | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useSession() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}

async function deleteUserAvatar(path: string) {
  console.log("received avatar path to delete:", path);
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from("avatars").remove([path]);
  if (error) {
    console.log("error deleting user avatar:", error.message);
    return error;
  }
  console.log("successfully deleted user avatar");
  return null;
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      return error;
    }
    return null;
  };

  const signOut = async () => {
    const main = getSocket();
    if (main.connected) main.disconnect();
    const chats = getSocket("/chats");
    if (chats.connected) chats.disconnect();
    const calls = getSocket("/calls");
    if (calls.connected) calls.disconnect();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return error;
    }
    return null;
  };

  const deleteAccount = async () => {
    const url = getBackendUrl();
    const userId = session?.user.id;
    if (!userId) {
      console.log("no user id found, returning..");
      return "No user ID found";
    }
    try {
      const { data, error: userFetchError } = await supabase
        .from("users")
        .select("avatar_url")
        .eq("id", userId)
        .single();
      if (userFetchError) {
        console.log("erorr retrieving avatar url:", userFetchError.message);
        return userFetchError.message;
      }

      const storageError = await deleteUserAvatar(data.avatar_url);
      if (storageError) {
        return storageError.message;
      }

      const response = await axiosConfig.delete(url + "/api/users/delete", {
        data: { userId: userId },
        headers: { "Content-Type": "application/json" },
      });
      console.log("deleting user:", response.data);
      await AsyncStorage.clear();
      const authError = await signOut();
      if (authError) {
        return authError.message;
      }
      return null;
    } catch (err) {
      console.log("error while deleting user:", (err as Error).message);
      return (err as Error).message;
    }
  };

  // TODO: must change and edit to NOT use session; just return user.

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useSession, SessionProvider };
