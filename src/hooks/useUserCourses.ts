import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "./supabaseClient";
import { useSession } from "@/src/context/AuthContext";

function useUserCourses() {
  const supabase = getSupabaseClient();
  const { session } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserCourses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("user_enrollments").select("*").eq("user_id", session?.user.id);
    if (error) {
      console.log("error while fetching user courses: " + error.message);
      return;
    }
    setCourses(data);
    setLoading(false);
  }, [session?.user.id]);

  const addUserCourse = useCallback(
    async (courseId: string, level: string) => {
      const { data, error } = await supabase
        .from("enrollments")
        .upsert(
          {
            user_id: session?.user.id,
            language_course_id: courseId,
            level: level,
          },
          { onConflict: "user_id, language_course_id" },
        )
        .select();
      if (error) {
        console.log("error while adding course: " + error.message);
        return { result: error };
      }
      return { result: null };
    },
    [session?.user.id],
  );

  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  return { courses, loading, addUserCourse };
}

export { useUserCourses };
