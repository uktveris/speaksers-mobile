import { Colors } from "@/src/constants/Colors";
import { levels } from "@/src/constants/languageLevels";
import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { ColorSchemeName } from "react-native";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function LanguageCourseSelection() {
  const { addUserCourse } = useUserCourses();
  const [courses, setCourses] = useState<{ name: string; id: string }[]>([]);
  const theme = Appearance.getColorScheme();
  const [selectedCourse, setSelectedCourse] = useState(null);
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
    const { result } = await addUserCourse(selectedCourse!, selectedLevel);
    if (result === null) {
      routerReplace(ROUTES.homeScreen);
    } else {
      console.log({ result });
      console.log("something went wrong while adding course");
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Text>Add language CEFR level</Text>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue, itemIndex) => setSelectedCourse(itemValue)}
        >
          {courses.map((course) => (
            <Picker.Item
              key={course.id}
              label={course.name}
              value={course.id}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedLevel}
          onValueChange={(itemValue, itemIndex) => setSelectedLevel(itemValue)}
        >
          {levels.map((level, index) => (
            <Picker.Item key={index} label={level} value={level} />
          ))}
        </Picker>
        <Pressable onPress={addCourse}>
          <Text>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default LanguageCourseSelection;
