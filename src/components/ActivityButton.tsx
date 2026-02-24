import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ActivityConfig } from '../types';

interface Props {
  activity: ActivityConfig;
  stickerUrl?: string | null;
  onPress: () => void;
}

export default function ActivityButton({ activity, stickerUrl, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.circle,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        {stickerUrl ? (
          <Image source={{ uri: stickerUrl }} style={styles.stickerImage} contentFit="cover" />
        ) : (
          <Ionicons
            name={activity.icon as any}
            size={32}
            color={colors.primary}
          />
        )}
      </View>
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {activity.label}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
        {activity.subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '33.33%',
    marginBottom: 20,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
