import React, { useCallback, useRef } from 'react';
import { Pressable, Text, View, StyleSheet, Animated } from 'react-native';
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
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const animatedStyle = {
    transform: [
      { scale },
      {
        rotate: rotate.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-3deg', '0deg', '3deg'],
        }),
      },
    ],
  };

  const handlePressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 0.88,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: -1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.spring(rotate, {
          toValue: 0,
          friction: 5,
          tension: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPress();
  }, [scale, rotate, onPress]);

  return (
    <Pressable
      style={styles.wrapper}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
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
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '33.33%',
  },
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 1,
  },
});
