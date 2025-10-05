import { getDateWithLocale } from "@/src/utils/dateUtils";
import { Text } from "react-native";
import { View } from "react-native";

interface ProfileCourseInfoProps {
  language: string;
  level: string;
  startedLearning: string;
  localeLangTag: string;
  timeZone: string;
}

function ProfileCourseInfo({ language, level, startedLearning, localeLangTag, timeZone }: ProfileCourseInfoProps) {
  const enrolledAtDate = new Date(startedLearning);
  const formattedDate = getDateWithLocale(enrolledAtDate, localeLangTag, timeZone);

  return (
    <View className="rounded-xl overflow-hidden mt-2">
      <View className="flex flex-row">
        <View className="grow basis-1/4 flex items-center justify-center bg-primary py-2">
          <Text className="text-text-dark font-bold text-xl">{language}</Text>
          <Text className="text-text-dark">{level}</Text>
        </View>
        <View className="grow basis-3/4 flex items-center justify-center bg-contrast-light dark:bg-contrast-dark py-2">
          <Text className="text-text-dark dark:text-text-light text-sm">Started: {formattedDate}</Text>
        </View>
      </View>
    </View>
  );
}

export default ProfileCourseInfo;
