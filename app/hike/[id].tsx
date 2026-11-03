import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { RatingStars } from '../../components/RatingStars';
import { colors } from '../../constants/theme';
import { useHikes } from '../../context/HikesContext';
import { formatHikeDate } from '../../lib/hikes';

export default function HikeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hikes, loading, loadError, reload, deleteHike } = useHikes();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const hike = hikes.find((item) => item.id === id);

  async function handleDelete() {
    if (!hike) return;

    setDeleting(true);
    setDeleteError(false);
    try {
      await deleteHike(hike.id);
      router.replace('/');
    } catch {
      setDeleteError(true);
    } finally {
      setDeleting(false);
    }
  }

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
        <Text style={styles.messageTitle}>This hike could not be opened</Text>
        <Button label="Try again" onPress={() => void reload()} />
      </SafeAreaView>
    );
  }

  if (!hike) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.messageTitle}>Hike not found</Text>
        <Text style={styles.messageText}>It may have been removed from your log.</Text>
        <Button label="Back to my hikes" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Hike details' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>{formatHikeDate(hike.date)}</Text>
        <Text style={styles.heading}>{hike.name}</Text>
        <View style={styles.ratingRow}>
          <RatingStars rating={hike.rating} size={24} />
          <Text style={styles.ratingText}>{hike.rating} out of 5</Text>
        </View>

        <View style={styles.measurements}>
          <View style={styles.measurementCard}>
            <Text style={styles.measurementValue}>{hike.distanceKm}</Text>
            <Text style={styles.measurementLabel}>kilometres</Text>
          </View>
          <View style={styles.measurementCard}>
            <Text style={styles.measurementValue}>{hike.elevationGainM}</Text>
            <Text style={styles.measurementLabel}>metres gained</Text>
          </View>
        </View>

        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>NOTES</Text>
          <Text style={hike.notes ? styles.notes : styles.noNotes}>
            {hike.notes || 'No notes for this hike.'}
          </Text>
        </View>

        <Button
          label="Edit hike"
          onPress={() => router.push({ pathname: '/hike/form', params: { id: hike.id } })}
          style={styles.editButton}
        />

        {confirmingDelete ? (
          <View style={styles.deletePanel}>
            <Text style={styles.deleteTitle}>Delete this hike?</Text>
            <Text style={styles.deleteText}>This cannot be undone.</Text>
            {deleteError && <Text style={styles.errorText}>The hike could not be deleted. Try again.</Text>}
            <View style={styles.deleteActions}>
              <Button
                label="Keep hike"
                variant="secondary"
                disabled={deleting}
                onPress={() => {
                  setConfirmingDelete(false);
                  setDeleteError(false);
                }}
                style={styles.deleteButton}
              />
              <Button
                label={deleting ? 'Deleting…' : 'Delete hike'}
                variant="danger"
                disabled={deleting}
                onPress={() => void handleDelete()}
                style={styles.deleteButton}
              />
            </View>
          </View>
        ) : (
          <Button label="Delete hike" variant="danger" onPress={() => setConfirmingDelete(true)} style={styles.deleteButton} />
        )}
      </ScrollView>
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
    gap: 14,
    padding: 28,
  },
  messageTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  messageText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
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
  date: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 7,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  ratingText: {
    color: colors.muted,
    fontSize: 14,
  },
  measurements: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 26,
  },
  measurementCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  measurementValue: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '800',
  },
  measurementLabel: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  notesCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    padding: 20,
  },
  notesLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  notes: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 26,
  },
  noNotes: {
    color: colors.muted,
    fontSize: 16,
    fontStyle: 'italic',
  },
  editButton: {
    marginTop: 24,
  },
  deletePanel: {
    backgroundColor: colors.dangerTint,
    borderRadius: 16,
    marginTop: 12,
    padding: 18,
  },
  deleteTitle: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
  },
  deleteText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 5,
  },
  deleteActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  deleteButton: {
    flexGrow: 1,
    marginTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 10,
  },
});
