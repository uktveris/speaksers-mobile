import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";

interface ProfileCourseInfoProps {
  language: string;
  level: string;
  startedLearning: string;
}

function ProfileCourseInfo({
  language,
  level,
  startedLearning,
}: ProfileCourseInfoProps) {
  const enrolledAtDate = new Date(startedLearning);

  return (
    <View style={styles.container}>
      <View>
        <Text>{language}</Text>
        <Text>{level}</Text>
      </View>
      <Text>{enrolledAtDate.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: "yellow",
    borderWidth: 2,
  },
});

export default ProfileCourseInfo;
