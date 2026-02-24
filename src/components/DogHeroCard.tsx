import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Dog } from '../types';

interface Props {
  dog: Dog;
}

export default function DogHeroCard({ dog }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {dog.originalPhotoUrl ? (
        <Image
          source={{ uri: dog.originalPhotoUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.heroImage, { backgroundColor: colors.surfaceElevated }]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <View style={[styles.statusBadge, { backgroundColor: colors.heroBadgeBg }]}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, { color: colors.heroText }]}>
            Currently Active
          </Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.heroText }]}>
          What's {dog.name}{'\n'}doing?
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
    height: 220,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
});
