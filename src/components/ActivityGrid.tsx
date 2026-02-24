import React from 'react';
import { View, StyleSheet } from 'react-native';
import ActivityButton from './ActivityButton';
import { ACTIVITIES } from '../constants/activities';
import { ActivityType } from '../types';

interface Props {
  stickerUrl?: string | null;
  onActivityPress: (type: ActivityType) => void;
}

export default function ActivityGrid({ stickerUrl, onActivityPress }: Props) {
  return (
    <View style={styles.container}>
      {ACTIVITIES.map((activity) => (
        <ActivityButton
          key={activity.type}
          activity={activity}
          stickerUrl={stickerUrl}
          onPress={() => onActivityPress(activity.type)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 24,
  },
});
