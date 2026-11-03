import { StyleSheet, Text } from 'react-native';

import { colors } from '../constants/theme';
import type { Rating } from '../lib/hikes';

export function RatingStars({ rating, size = 18 }: { rating: Rating; size?: number }) {
  return (
    <Text
      accessibilityLabel={`${rating} out of 5 stars`}
      style={[styles.stars, { fontSize: size }]}
    >
      {'★'.repeat(rating)}
      <Text style={styles.emptyStars}>{'☆'.repeat(5 - rating)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  stars: {
    color: colors.star,
    letterSpacing: 1,
  },
  emptyStars: {
    color: colors.starEmpty,
  },
});
