import { Text } from "react-native";
import { View } from "react-native";

interface ProfileCourseInfoProps {
  language: string;
  level: string;
  startedLearning: Date;
}

function ProfileCourseInfo({
  language,
  level,
  startedLearning,
}: ProfileCourseInfoProps) {
  return (
    <View>
      <View>
        <Text>{language}</Text>
        <Text>{level}</Text>
      </View>
      <Text>{startedLearning.toLocaleString()}</Text>
    </View>
  );
}

export default ProfileCourseInfo;
