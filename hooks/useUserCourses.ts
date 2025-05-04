import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "./supabaseClient";
import { useSession } from "@/context/AuthContext";

function useUserCourses() {
  const supabase = getSupabaseClient();
  const { session } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserCourses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", session?.user.id);
    if (error) {
      console.log("erorr while fetching user courses: " + error.message);
      return;
    }
    setCourses(data);
    setLoading(false);
  }, [session?.user.id]);

  const addUserCourse = useCallback(
    async (
      courseId: string,
      level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
    ) => {
      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: session?.user.id, language_course_id: courseId });
      if (error) {
        console.log("error while inserting user course: " + error.message);
        return { success: false };
      }
      return { success: true };
    },
    [session?.user.id],
  );

  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  return { courses, loading, addUserCourse };
}

export { useUserCourses };
