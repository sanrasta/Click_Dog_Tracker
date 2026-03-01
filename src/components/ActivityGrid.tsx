import React from 'react';
import { View, StyleSheet } from 'react-native';
import ActivityButton from './ActivityButton';
import { ACTIVITIES } from '../constants/activities';
import { ActivityType } from '../types';

const COLUMNS = 3;
const ROWS = 3;
const MAX_ITEMS = COLUMNS * ROWS;

interface Props {
  stickerUrl?: string | null;
  onActivityPress: (type: ActivityType) => void;
}

export default function ActivityGrid({ stickerUrl, onActivityPress }: Props) {
  const visibleActivities = ACTIVITIES.slice(0, MAX_ITEMS);

  return (
    <View style={styles.container}>
      {visibleActivities.map((activity) => (
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 12,
  },
});
