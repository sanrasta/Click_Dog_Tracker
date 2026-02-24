import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useActiveDog } from '../queries/useDogQueries';

export default function ProfileScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const { user, isDevMode, devLogout } = useAuth();
  const { data: dog } = useActiveDog();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (isDevMode) {
            devLogout();
          } else {
            signOut(auth);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {dog?.originalPhotoUrl ? (
          <Image source={{ uri: dog.originalPhotoUrl }} style={styles.dogPhoto} />
        ) : (
          <View style={[styles.dogPhoto, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="paw" size={32} color={colors.primary} />
          </View>
        )}
        <Text style={[styles.dogName, { color: colors.text }]}>
          {dog?.name ?? 'No dog added'}
        </Text>
        <Text style={[styles.dogBreed, { color: colors.textSecondary }]}>
          {dog?.breed ?? 'Add your pup in onboarding'}
        </Text>
      </View>

      <View style={styles.settings}>
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingLeft}>
            <Ionicons
              name={mode === 'dark' ? 'moon' : 'sunny'}
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.settingText, { color: colors.text }]}>
              {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              {user?.displayName ?? user?.email ?? 'Account'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.settingText, { color: colors.error }]}>
              Sign Out
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.textMuted }]}>
        Click Dog Track v1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
  dogPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dogName: {
    fontSize: 22,
    fontWeight: '700',
  },
  dogBreed: {
    fontSize: 15,
    marginTop: 4,
  },
  settings: {
    marginHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 32,
  },
});
