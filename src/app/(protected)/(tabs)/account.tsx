import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { View } from "react-native";
import { Text } from "react-native";
import { SafeAreaView } from "react-native";
import ProfileInfo from "@/src/components/ProfileInfo";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import ProfileCourseInfo from "@/src/components/ProfileCourseInfo";
import { useLocale } from "@/src/context/LocaleContext";
import { Pressable } from "react-native";
import { routerPush, routerReplace, ROUTES } from "@/src/utils/navigation";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

function Account() {
  const theme = Appearance.getColorScheme();
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const { courses, loading } = useUserCourses();
  const { locales, calendars } = useLocale();
  const barHeight = useBottomTabBarHeight();

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
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <View style={{ paddingTop: barHeight - 10 }} className="flex-1 px-2">
        <View className="flex flex-row justify-between">
          <Pressable
            className="bg-secondary py-1 px-6 rounded-3xl"
            onPress={handleEditProfile}
          >
            <Text className="text-button_text font-bold text-xl">Edit</Text>
          </Pressable>
          <Pressable
            className="bg-secondary py-1 px-6 rounded-3xl"
            onPress={handleGoToSettings}
          >
            <Text className="text-button_text font-bold text-xl">Settings</Text>
          </Pressable>
        </View>
        <ProfileInfo />
        <View className="pt-2 flex-1">
          <Text className="text-text-light dark:text-text-dark text-xl font-bold">
            Languages
          </Text>
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
