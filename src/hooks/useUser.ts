import { useEffect, useState } from "react";
import { getSupabaseClient } from "./supabaseClient";
import { useSession } from "../context/AuthContext";

function useUser() {
  const [userData, setUserData] = useState<{} | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const { session } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) {
        console.log("cannot find session, returning..");
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.log("error retrieving user:", error.message);
        return;
      }

      const { data: avatarData } = supabase.storage
        .from("avatars")
        .getPublicUrl(
          data.avatar_url +
            "?updated_at=" +
            (data.avatar_updated_at || Date.now()),
        );
      setUserData(data);
      setAvatarUrl(avatarData.publicUrl);
      setLoading(false);
    };

    fetchUserData();
  }, [session?.user.id]);
  return { userData, avatarUrl, loading };
}

export { useUser };
