import { Colors } from "@/constants/Colors";
import { useSession } from "@/context/AuthContext";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";
import { Image } from "react-native";
import { SafeAreaView } from "react-native";
import ProfileInfo from "@/components/ProfileInfo";
import { useUserCourses } from "@/hooks/useUserCourses";
import ProfileCourseInfo from "@/components/ProfileCourseInfo";

function Account() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const { courses, loading } = useUserCourses();

  useEffect(() => {
    if (!loading && courses.length !== 0) {
      setUserCourses(courses);
    }
  }, [courses.length]);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.container}>
        <Text style={GlobalStyles.smallText}>settings?</Text>
        <ProfileInfo />
        <View style={GlobalStyles.verticalSpacerSmall} />
        <Text style={[GlobalStyles.mediumBoldText, styles.languagesText]}>
          Languages
        </Text>
        <View style={GlobalStyles.verticalSpacerSmall} />
        {userCourses.map((course, key) => (
          <ProfileCourseInfo
            key={key}
            language={course.name}
            level={course.level}
            startedLearning={course.enrolled_at}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

export default Account;

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingVertical: 20,
    },
    languagesText: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
    },
    text: {
      color: theme === "light" ? Colors.light.text : Colors.dark.text,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
  });
}
