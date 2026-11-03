import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { RatingStars } from '../components/RatingStars';
import { colors } from '../constants/theme';
import { useHikes } from '../context/HikesContext';
import { formatHikeDate, type Hike } from '../lib/hikes';

export default function HikeListScreen() {
  const router = useRouter();
  const { hikes, loading, loadError, reload } = useHikes();

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Opening your hiking log…</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.errorTitle}>Your hikes could not be opened</Text>
        <Text style={styles.errorText}>Check your phone storage and try again.</Text>
        <Button label="Try again" onPress={() => void reload()} />
      </SafeAreaView>
    );
  }

  function renderHike({ item }: ListRenderItemInfo<Hike>) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name}`}
        onPress={() => router.push({ pathname: '/hike/[id]', params: { id: item.id } })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeading}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.date}>{formatHikeDate(item.date)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.measurement}>{item.distanceKm} km</Text>
          <Text style={styles.detailDivider}>·</Text>
          <Text style={styles.measurement}>{item.elevationGainM} m gain</Text>
        </View>
        <RatingStars rating={item.rating} />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <FlatList
        data={hikes}
        keyExtractor={(item) => item.id}
        renderItem={renderHike}
        contentContainerStyle={[styles.content, hikes.length === 0 && styles.emptyContent]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MY TIME OUTSIDE</Text>
            <Text style={styles.heading}>Your hikes</Text>
            <Text style={styles.subheading}>
              {hikes.length === 1 ? '1 hike in your log' : `${hikes.length} hikes in your log`}
            </Text>
            <View style={styles.actions}>
              <Button label="+ Add hike" onPress={() => router.push('/hike/form')} style={styles.actionButton} />
              <Button label="View stats" variant="secondary" onPress={() => router.push('/stats')} style={styles.actionButton} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hikes yet</Text>
            <Text style={styles.emptyText}>Add your first hike to start your log.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    padding: 28,
    gap: 14,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 8,
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 36,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subheading: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  cardPressed: {
    backgroundColor: colors.tint,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },
  date: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 5,
  },
  chevron: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 32,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 13,
  },
  measurement: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  detailDivider: {
    color: colors.muted,
  },
  separator: {
    height: 12,
  },
  emptyCard: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
