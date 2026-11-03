import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { colors } from '../../constants/theme';
import { useHikes } from '../../context/HikesContext';
import type { Hike, Rating } from '../../lib/hikes';

type FormErrors = Partial<Record<'name' | 'date' | 'distance' | 'elevation', string>>;

export default function HikeFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { hikes, loading, loadError, reload } = useHikes();
  const hike = id ? hikes.find((item) => item.id === id) : undefined;

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
        <Text style={styles.messageTitle}>Your hikes could not be opened</Text>
        <Button label="Try again" onPress={() => void reload()} />
      </SafeAreaView>
    );
  }

  if (id && !hike) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.messageTitle}>Hike not found</Text>
        <Button label="Back to my hikes" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  return <HikeForm key={hike?.id ?? 'new'} hike={hike} />;
}

function HikeForm({ hike }: { hike?: Hike }) {
  const router = useRouter();
  const { addHike, updateHike } = useHikes();
  const [name, setName] = useState(hike?.name ?? '');
  const [date, setDate] = useState(hike?.date ?? today());
  const [distance, setDistance] = useState(hike ? String(hike.distanceKm) : '');
  const [elevation, setElevation] = useState(hike ? String(hike.elevationGainM) : '');
  const [rating, setRating] = useState<Rating>(hike?.rating ?? 3);
  const [notes, setNotes] = useState(hike?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  async function handleSubmit() {
    const nextErrors: FormErrors = {};
    const distanceKm = Number(distance);
    const elevationGainM = Number(elevation);

    if (!name.trim()) {
      nextErrors.name = 'Enter a name for this hike.';
    }
    if (!isRealDate(date)) {
      nextErrors.date = 'Use a real date in YYYY-MM-DD format.';
    }
    if (!distance.trim() || !Number.isFinite(distanceKm) || distanceKm <= 0) {
      nextErrors.distance = 'Enter a distance greater than zero.';
    }
    if (!elevation.trim() || !Number.isInteger(elevationGainM) || elevationGainM < 0) {
      nextErrors.elevation = 'Enter a whole number of metres, or zero.';
    }

    setErrors(nextErrors);
    setSaveError(false);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const draft = {
        name: name.trim(),
        date,
        distanceKm,
        elevationGainM,
        rating,
        notes: notes.trim() || undefined,
      };

      if (hike) {
        await updateHike(hike.id, draft);
      } else {
        await addHike(draft);
      }
      router.back();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <Stack.Screen options={{ title: hike ? 'Edit hike' : 'Add hike' }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{hike ? 'Edit your hike' : 'Add a hike'}</Text>
        <Text style={styles.subheading}>
          {hike ? 'Update the details you want to remember.' : 'Keep the details you want to look back on.'}
        </Text>

        <View style={styles.form}>
          <Field label="Hike name" error={errors.name}>
            <TextInput
              accessibilityLabel="Hike name"
              editable={!saving}
              onChangeText={setName}
              placeholder="e.g. Ridgeline Loop"
              placeholderTextColor={colors.muted}
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
            />
          </Field>

          <Field label="Date" error={errors.date}>
            <TextInput
              accessibilityLabel="Hike date"
              autoCapitalize="none"
              editable={!saving}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              style={[styles.input, errors.date && styles.inputError]}
              value={date}
            />
          </Field>

          <View style={styles.numberRow}>
            <Field label="Distance (km)" error={errors.distance} style={styles.numberField}>
              <TextInput
                accessibilityLabel="Distance in kilometres"
                editable={!saving}
                inputMode="decimal"
                keyboardType="decimal-pad"
                onChangeText={setDistance}
                placeholder="0.0"
                placeholderTextColor={colors.muted}
                style={[styles.input, errors.distance && styles.inputError]}
                value={distance}
              />
            </Field>

            <Field label="Elevation gain (m)" error={errors.elevation} style={styles.numberField}>
              <TextInput
                accessibilityLabel="Elevation gain in metres"
                editable={!saving}
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setElevation}
                placeholder="0"
                placeholderTextColor={colors.muted}
                style={[styles.input, errors.elevation && styles.inputError]}
                value={elevation}
              />
            </Field>
          </View>

          <View style={styles.ratingField}>
            <Text style={styles.label}>Rating</Text>
            <View style={styles.ratingButtons}>
              {([1, 2, 3, 4, 5] as Rating[]).map((value) => (
                <Pressable
                  accessibilityLabel={`${value} ${value === 1 ? 'star' : 'stars'}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: rating === value }}
                  disabled={saving}
                  key={value}
                  onPress={() => setRating(value)}
                  style={({ pressed }) => [
                    styles.ratingButton,
                    rating >= value && styles.ratingButtonSelected,
                    pressed && styles.ratingButtonPressed,
                  ]}
                >
                  <Text style={[styles.ratingStar, rating >= value && styles.ratingStarSelected]}>★</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field label="Notes (optional)">
            <TextInput
              accessibilityLabel="Hike notes"
              editable={!saving}
              multiline
              onChangeText={setNotes}
              placeholder="Trail conditions, good moments, things to remember…"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.notesInput]}
              textAlignVertical="top"
              value={notes}
            />
          </Field>
        </View>

        {saveError && <Text style={styles.saveError}>The hike could not be saved. Try again.</Text>}
        <Button label={saving ? 'Saving…' : hike ? 'Save changes' : 'Add hike'} disabled={saving} onPress={() => void handleSubmit()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, error, children, style }: {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function isRealDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
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
    paddingBottom: 40,
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
    lineHeight: 23,
    marginTop: 6,
  },
  form: {
    gap: 20,
    marginTop: 26,
    marginBottom: 24,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  numberField: {
    flexGrow: 1,
    flexBasis: 180,
  },
  ratingField: {
    gap: 0,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  ratingButtonSelected: {
    backgroundColor: colors.tint,
    borderColor: colors.primary,
  },
  ratingButtonPressed: {
    opacity: 0.65,
  },
  ratingStar: {
    color: colors.starEmpty,
    fontSize: 25,
  },
  ratingStarSelected: {
    color: colors.star,
  },
  notesInput: {
    minHeight: 130,
  },
  saveError: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});
