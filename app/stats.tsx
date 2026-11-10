import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useHikes } from '../context/HikesContext';

export default function StatsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { hikes, loading, loadError, reload } = useHikes();
  const totalDistance = hikes.reduce((sum, hike) => sum + hike.distanceKm, 0);
  const totalElevation = hikes.reduce((sum, hike) => sum + hike.elevationGainM, 0);
  const longestHike = hikes.reduce<(typeof hikes)[number] | null>(
    (longest, hike) => !longest || hike.distanceKm > longest.distanceKm ? hike : longest,
    null,
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.messageTitle}>Your stats are not available</Text>
        <Button label="Try again" onPress={() => void reload()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>THE BIG PICTURE</Text>
        <Text style={styles.heading}>Your hiking stats</Text>
        <Text style={styles.subheading}>A look at everything in your log.</Text>

        <View style={styles.grid}>
          <StatCard label="Total hikes" value={String(hikes.length)} />
          <StatCard label="Total distance" value={`${totalDistance.toFixed(1)} km`} />
          <StatCard label="Elevation gained" value={`${Math.round(totalElevation).toLocaleString()} m`} />
        </View>

        <View style={styles.longestCard}>
          <Text style={styles.longestLabel}>LONGEST HIKE</Text>
          {longestHike ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/hike/[id]', params: { id: longestHike.id } })}
              style={({ pressed }) => pressed && styles.longestPressed}
            >
              <Text style={styles.longestName}>{longestHike.name}</Text>
              <Text style={styles.longestDistance}>{longestHike.distanceKm} km</Text>
              <Text style={styles.viewDetails}>View hike details ›</Text>
            </Pressable>
          ) : (
            <Text style={styles.emptyText}>Your longest hike will appear here once you add one.</Text>
          )}
        </View>

        <Button label="Sign out" variant="secondary" onPress={() => void signOut()} style={styles.signOutButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 28,
  },
  messageTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 36,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  heading: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheading: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 26,
  },
  statCard: {
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  statValue: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  longestCard: {
    backgroundColor: colors.tint,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    padding: 22,
  },
  longestLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  longestPressed: {
    opacity: 0.65,
  },
  longestName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  longestDistance: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
  },
  viewDetails: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 18,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  signOutButton: {
    marginTop: 24,
  },
});
