import { useEffect, useState } from "react";
import { useSupabase } from "./useSupabase";

export default function useAuth() {
  const supabase = useSupabase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    checkUser();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("error from useAuth: " + error.message);
    }
  };

  return { user, loading, signOut };
}
