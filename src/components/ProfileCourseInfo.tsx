import { Colors } from "@/src/constants/Colors";
import { GlobalStyles } from "@/src/constants/StyleConstants";
import { getDateWithLocale } from "@/src/utils/dateUtils";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";

interface ProfileCourseInfoProps {
  language: string;
  level: string;
  startedLearning: string;
  localeLangTag: string;
  timeZone: string;
}

function ProfileCourseInfo({
  language,
  level,
  startedLearning,
  localeLangTag,
  timeZone,
}: ProfileCourseInfoProps) {
  const enrolledAtDate = new Date(startedLearning);
  const formattedDate = getDateWithLocale(
    enrolledAtDate,
    localeLangTag,
    timeZone,
  );

  return (
    <View style={styles.container}>
      <View style={styles.enrollmentInfo}>
        <Text style={GlobalStyles.mediumBoldText}>{language}</Text>
        <Text style={GlobalStyles.smallText}>{level}</Text>
      </View>
      <View style={styles.date}>
        <Text style={GlobalStyles.smallTextBold}>Started: {formattedDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
  },
  enrollmentInfo: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: Colors.base.darkPrimaryTint,
  },
  date: {
    flex: 2,
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: Colors.base.darkTint,
  },
});

export default ProfileCourseInfo;
