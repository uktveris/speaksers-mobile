import { levels } from "@/src/constants/languageLevels";
import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function LanguageCourseSelection() {
  const { addUserCourse } = useUserCourses();
  const [courses, setCourses] = useState<{ name: string; id: string }[]>([]);
  const theme = Appearance.getColorScheme();
  const [selectedCourse, setSelectedCourse] = useState<{
    name: string;
    id: string;
  } | null>(courses ? courses[0] : null);
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);

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
      setCourses(data);
      setSelectedCourse(data[0].id);
    };

    fetchCourses();
  }, []);

  const addCourse = async () => {
    const { result } = await addUserCourse(selectedCourse!.id, selectedLevel);
    if (result === null) {
      routerReplace(ROUTES.homeScreen);
    } else {
      console.log({ result });
      console.log("something went wrong while adding course");
    }
  };

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <View className="flex flex-1 justify-center items-center">
        <Text className="text-text-light dark:text-text-dark font-bold text-xl m-4">
          Add language CEFR level
        </Text>
        {courses.map((course, key) => (
          <Pressable
            onPress={() => setSelectedCourse(course)}
            key={key}
            className={`flex w-3/4 justify-center items-center rounded-xl p-4 mb-4 border border-${course.id === selectedCourse?.id ? "primary" : "secondary"}`}
          >
            <Text className="text-text-light dark:text-text-dark font-bold">
              {course.name}
            </Text>
          </Pressable>
        ))}
        {levels.map((level, key) => (
          <Pressable
            onPress={() => setSelectedLevel(level)}
            key={key}
            className={`flex w-3/4 justify-center items-center rounded-xl p-4 mb-4 border border-${level === selectedLevel ? "primary" : "secondary"}`}
          >
            <Text className="text-text-light dark:text-text-dark font-bold">
              {level}
            </Text>
          </Pressable>
        ))}
        <Pressable
          className="bg-primary w-3/4  p-3 flex items-center rounded-3xl"
          onPress={addCourse}
        >
          <Text className="text-text-dark font-bold">Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default LanguageCourseSelection;
