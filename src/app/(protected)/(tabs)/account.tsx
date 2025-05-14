import { Colors } from "@/src/constants/Colors";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { GlobalStyles } from "@/src/constants/StyleConstants";
import { SafeAreaView } from "react-native";
import ProfileInfo from "@/src/components/ProfileInfo";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import ProfileCourseInfo from "@/src/components/ProfileCourseInfo";
import { useLocale } from "@/src/context/LocaleContext";
import { Pressable } from "react-native";
import { routerPush, routerReplace, ROUTES } from "@/src/utils/navigation";

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

  const handleEditProfile = () => {
    routerReplace(ROUTES.editAccount);
  };

  const handleGoToSettings = () => {
    routerPush(ROUTES.settings);
  };

  return (
    <SafeAreaView style={[GlobalStyles.container, { paddingTop: 30 }]}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleEditProfile}
            style={GlobalStyles.secondaryButtonSmall}
          >
            <Text style={GlobalStyles.smallTextBold}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleGoToSettings}
            style={GlobalStyles.primaryButtonSmall}
          >
            <Text style={GlobalStyles.smallTextBold}>Settings</Text>
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
      // paddingVertical: 20,
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
      paddingHorizontal: 10,
      width: "100%",
    },
  });
}
