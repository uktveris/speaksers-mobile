import { levels } from "@/src/constants/languageLevels";
import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { useColorScheme } from "nativewind";

function LanguageCourseSelection() {
  const { addUserCourse } = useUserCourses();
  const [courses, setCourses] = useState<{ name: string; id: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(selectedCourse !== null && selectedLevel !== null);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    const supabase = getSupabaseClient();
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("language_courses").select();
      if (error) {
        console.log("error retrieving language course list: " + error.message);
        return;
      }
      setCourses(data);
    };

    fetchCourses();
  }, []);

  const addCourse = async () => {
    if (!selectedCourse || !selectedLevel) {
      Alert.alert("Select language", "Select language and CEFR level to add", [
        { text: "Cancel", onPress: () => console.log("warning closed") },
      ]);
      return;
    }
    const { result } = await addUserCourse(selectedCourse.id, selectedLevel);
    if (result === null) {
      routerReplace(ROUTES.homeScreen);
    } else {
      console.log({ result });
      console.log("something went wrong while adding course");
    }
  };

  useEffect(() => {
    setCanContinue(selectedCourse !== null && selectedLevel !== null);
  }, [selectedCourse, selectedLevel]);

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <ScrollView>
        <View className="flex flex-1 justify-center items-center py-3">
          <Text className="text-text-light dark:text-text-dark font-bold text-xl m-4">
            Add language and your CEFR level
          </Text>
          {courses.map((course, key) => (
            <Pressable
              onPress={() => setSelectedCourse(course)}
              key={key}
              className={`flex w-3/4 justify-center items-center rounded-xl p-4 mb-4 border ${course.id === selectedCourse?.id ? "border-primary" : colorScheme === "light" ? "border-contrast-light" : "border-contrast-dark"}`}
            >
              <Text className="text-text-light dark:text-text-dark font-bold">{course.name}</Text>
            </Pressable>
          ))}
          {levels.map((level, key) => (
            <Pressable
              onPress={() => setSelectedLevel(level)}
              key={key}
              className={`flex w-3/4 justify-center items-center rounded-xl p-4 mb-4 border ${level === selectedLevel ? "border-primary" : colorScheme === "light" ? "border-contrast-light" : "border-contrast-dark"}`}
            >
              <Text className="text-text-light dark:text-text-dark font-bold">{level}</Text>
            </Pressable>
          ))}
          <Pressable
            disabled={!canContinue}
            className={`bg-primary w-3/4  p-3 flex items-center rounded-3xl ${!canContinue ? "opacity-50" : ""}`}
            onPress={addCourse}
          >
            <Text className="text-text-dark font-bold">Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LanguageCourseSelection;
