import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "./supabaseClient";
import { useSession } from "../context/AuthContext";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

function useUser() {
  const [userData, setUserData] = useState<{} | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const { session } = useSession();

  const fetchUserData = useCallback(async () => {
    if (!session) {
      console.log("cannot find session, returning..");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.log("error retrieving user:", error.message);
      return;
    }

    const { data: avatarData, error: avatarError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(
        data.avatar_url +
          "?updated_at=" +
          (data.avatar_updated_at || Date.now()),
        60,
      );

    if (avatarError || !avatarData) {
      console.log("error while retrieving avatar: ", data.avatar_url);
      return;
    }

    setUserData(data);
    setAvatarUrl(avatarData.signedUrl);
    setLoading(false);
  }, [session?.user.id, supabase]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const updateUserData = async (newAvatarUri: string | null, name: string) => {
    setLoading(true);
    try {
      let filePath: string;
      if (!newAvatarUri) {
        filePath = (userData as any).avatar_url || "default-dark.png";
      } else {
        const extension = newAvatarUri.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = "image/" + (extension === "jpg" ? "jpeg" : extension);
        const base64Data = await FileSystem.readAsStringAsync(newAvatarUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const arrayBuffer = decode(base64Data);
        filePath = "avatars/" + session?.user.id + "/avatar." + extension;

        const { error: fileUploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: mimeType,
          });

        if (fileUploadError) {
          console.log("file upload error:", fileUploadError.message);
          setLoading(false);
          return false;
        }
      }

      const { data, error } = await supabase.from("users").upsert({
        id: session?.user.id,
        name: name,
        avatar_url: filePath,
        avatar_updated_at: new Date().toISOString(),
      });
      if (error) {
        console.log("error occurred while updating user:", error.message);
        setLoading(false);
        return false;
      }

      await fetchUserData();
      console.log("success, updated data:", data);
      setLoading(false);
      return true;
    } catch (err) {
      console.log("error:", (err as Error).message);
      setLoading(false);
      return false;
    }
  };

  return {
    userData,
    avatarUrl,
    loading,
    updateUserData,
    refetch: fetchUserData,
  };
}

export { useUser };
