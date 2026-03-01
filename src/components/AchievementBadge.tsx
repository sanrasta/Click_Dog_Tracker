import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function AchievementBadge({ emoji, title, description, unlocked }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor: unlocked ? colors.primaryLight : colors.surfaceElevated,
            borderColor: unlocked ? colors.primary : colors.border,
          },
        ]}
      >
        {unlocked ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : (
          <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
        )}
      </View>
      <Text
        style={[
          styles.title,
          { color: unlocked ? colors.text : colors.textMuted },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        style={[styles.description, { color: colors.textMuted }]}
        numberOfLines={2}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
});
