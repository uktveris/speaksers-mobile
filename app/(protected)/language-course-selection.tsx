import { Colors } from "@/constants/Colors";
import { levels } from "@/constants/languageLevels";
import { GlobalStyles } from "@/constants/StyleConstants";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useUserCourses } from "@/hooks/useUserCourses";
import { Picker } from "@react-native-picker/picker";
import { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { ColorSchemeName } from "react-native";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function LanguageCourseSelection() {
  const { addUserCourse } = useUserCourses();
  const router = useRouter();
  const [courses, setCourses] = useState<{ name: string; id: string }[]>([]);
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
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
      router.replace("/(protected)/(tabs)");
    } else {
      console.log({ result });
      console.log("something went wrong while adding course");
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.container}>
        <View style={GlobalStyles.verticalSpacerMedium}></View>
        <Text style={GlobalStyles.titleText}>Add language CEFR level</Text>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue, itemIndex) => setSelectedCourse(itemValue)}
          style={styles.picker}
        >
          {courses.map((course) => (
            <Picker.Item
              key={course.id}
              label={course.name}
              value={course.id}
            />
          ))}
        </Picker>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <Picker
          selectedValue={selectedLevel}
          onValueChange={(itemValue, itemIndex) => setSelectedLevel(itemValue)}
          style={styles.picker}
        >
          {levels.map((level, index) => (
            <Picker.Item key={index} label={level} value={level} />
          ))}
        </Picker>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <Pressable
          onPress={addCourse}
          style={[GlobalStyles.primaryButton, styles.button]}
        >
          <Text style={GlobalStyles.mediumBoldText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const setStyles = (theme: ColorSchemeName) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    button: {
      width: "40%",
    },
    picker: {
      width: "60%",
      height: 50,
      marginVertical: 20,
      backgroundColor: Colors.light.textField,
      color: theme === "light" ? Colors.light.text : Colors.dark.text,
      borderRadius: 10,
      borderWidth: 0,
      paddingHorizontal: 10,
    },
  });
};

export default LanguageCourseSelection;
