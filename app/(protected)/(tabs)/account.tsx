import { Colors } from "@/constants/Colors";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";
import { SafeAreaView } from "react-native";
import ProfileInfo from "@/components/ProfileInfo";
import { useUserCourses } from "@/hooks/useUserCourses";
import ProfileCourseInfo from "@/components/ProfileCourseInfo";
import { useLocale } from "@/context/LocaleContext";
import { Pressable } from "react-native";

function Account() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const { courses, loading } = useUserCourses();
  const { locales, calendars } = useLocale();

  useEffect(() => {
    if (!loading && courses.length !== 0) {
      setUserCourses(courses);
    }
  }, [courses.length]);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable style={GlobalStyles.secondaryButtonSmall}>
            <Text style={GlobalStyles.smallText}>Edit</Text>
          </Pressable>
          <Pressable style={GlobalStyles.primaryButtonSmall}>
            <Text style={GlobalStyles.smallText}>Settings</Text>
          </Pressable>
        </View>
        <ProfileInfo />
        <View style={GlobalStyles.verticalSpacerSmall} />
        <Text style={[GlobalStyles.mediumBoldText, styles.languagesText]}>
          Languages
        </Text>
        <View style={GlobalStyles.verticalSpacerSmall} />
        <View style={styles.courseContainer}>
          {userCourses.map((course, key) => (
            <ProfileCourseInfo
              key={key}
              language={course.name}
              level={course.level}
              startedLearning={course.enrolled_at}
              localeLangTag={locales[0].languageTag}
              timeZone={calendars[0].timeZone!}
            />
          ))}
        </View>
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
    courseContainer: {
      width: "100%",
      paddingHorizontal: 10,
      gap: 10,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 10,
      width: "100%",
    },
  });
}
