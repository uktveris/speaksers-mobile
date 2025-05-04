import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useUserCourses } from "@/hooks/useUserCourses";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function LanguageCourseSelection() {
  const { addUserCourse } = useUserCourses();
  const [courses, setCourses] = useState<{ name: string; id: string }[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("language_courses")
        .select("*");
      if (error) {
        console.log("error retrieving language course list: " + error.message);
        return;
      }
      console.log("course list: ");
      console.log({ data });
      setCourses(data);
    };

    fetchCourses();
  }, []);

  return (
    <SafeAreaView>
      <View>
        <Text>language course selection</Text>
      </View>
      <Picker>
        {courses.map((course) => (
          <Picker.Item key={course.id} label={course.name} value={course.id} />
        ))}
      </Picker>
    </SafeAreaView>
  );
}

export default LanguageCourseSelection;
