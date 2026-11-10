import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { ApiError } from '../lib/api';
import { Button } from './Button';

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up';
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const isSignIn = mode === 'sign-in';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(email.trim(), password);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        if (isSignIn && requestError.status === 401) {
          setError('The email or password is incorrect.');
        } else if (!isSignIn && requestError.status === 409) {
          setError('An account with this email already exists.');
        } else if (requestError.status === 400) {
          setError('Enter a valid email and a password of 8 to 128 characters.');
        } else {
          setError('The request could not be completed. Try again.');
        }
      } else {
        setError('The API could not be reached. Check that it is running and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>TRAIL LOG</Text>
          <Text style={styles.heading}>{isSignIn ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.subheading}>
            {isSignIn ? 'Sign in to open your hiking journal.' : 'Sign up to start your own hiking journal.'}
          </Text>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoComplete="email"
                editable={!submitting}
                inputMode="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                style={styles.input}
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <View>
              <Text style={styles.label}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                editable={!submitting}
                onChangeText={setPassword}
                onSubmitEditing={() => void handleSubmit()}
                placeholder="Your password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                textContentType={isSignIn ? 'password' : 'newPassword'}
                value={password}
              />
            </View>
          </View>

          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Button
            disabled={submitting}
            label={submitting ? 'Please wait…' : isSignIn ? 'Sign in' : 'Sign up'}
            onPress={() => void handleSubmit()}
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignIn ? 'New to Trail Log?' : 'Already have an account?'}
            </Text>
            <Pressable
              accessibilityRole="link"
              disabled={submitting}
              onPress={() => router.push(isSignIn ? '/sign-up' : '/sign-in')}
            >
              <Text style={styles.footerLink}>{isSignIn ? 'Create an account' : 'Sign in'}</Text>
            </Pressable>
          </View>

          {isSignIn && (
            <Text style={styles.demoText}>Demo account: demo@example.com · trailmix</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 10,
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
    marginTop: 8,
  },
  form: {
    gap: 18,
    marginTop: 28,
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
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 18,
  },
  submitButton: {
    marginTop: 22,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: colors.muted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  demoText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 24,
    textAlign: 'center',
  },
});
